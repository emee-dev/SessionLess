"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useStore } from "zustand";
import type { StoreApi } from "zustand/vanilla";
import { createStore } from "zustand/vanilla";
import { parseDSL } from "@/dsl/index";
import { MAX_ATTACHMENT_UPLOAD_SIZE } from "@/lib/constant";
import {
  type ActionRegistry,
  defaultActions,
  evaluateConditionalActions,
} from "./action-runtime";
import { resolveStaticActions } from "./static-actions";
import { resolveSubmissionValues } from "./submission";
import type {
  Field,
  FieldState,
  FormRuntime,
  Metadata,
  TioForm,
  Values,
} from "./types";
import { UploadProvider } from "./upload";
import { validateForm } from "./validation";

export interface FormState extends FormRuntime {
  form: TioForm;
  elements: Field[];
  errors: Record<string, string>;

  setValue: (fieldId: string, value: unknown) => void;
  setValues: (values: Values) => void;
  validate: () => boolean;
  submit: () => Promise<void>;
  recompute: () => void;
}

export type ResolveAttachment = ({
  field,
  value,
}: {
  field: Field;
  value: unknown;
}) => Promise<File | null>;

export interface CreateFormOptions {
  actions?: ActionRegistry;
  uploadFile?: UploadProvider;
  onSubmit: (values: Values) => Promise<void> | void;
  defaultValues: Record<string, unknown>;
  resolveAttachment?: ResolveAttachment;
}

async function createInitialFields(
  form: TioForm,
  values: Values,
  resolveAttachment?: ResolveAttachment,
) {
  const _tempValues = values;

  for (const field of form.fields) {
    if (field.type !== "attachment") continue;

    const oldValue = _tempValues[field.id];

    _tempValues[field.id] =
      (await resolveAttachment?.({ value: oldValue, field })) ?? oldValue;
  }

  const staticActions: Map<string, Metadata> = resolveStaticActions(
    form.static,
    _tempValues,
  );

  const fields: Record<string, FieldState> = {};

  for (const field of form.fields) {
    const globalConfig = staticActions.get(field.id);

    fields[field.id] = {
      visible: globalConfig?.visible ?? true,
      required: globalConfig?.required ?? false,
      metadata: {
        maxSize: MAX_ATTACHMENT_UPLOAD_SIZE,
        ...globalConfig,
      },
    };
  }

  return { fields, values: _tempValues };
}

function revalidateExpr(
  form: TioForm,
  values: Values,
  actions: ActionRegistry,
): Record<string, FieldState> {
  const staticConfig = resolveStaticActions(form.static, values);
  const draft = {} as Record<string, FieldState>;

  for (const field of form.fields) {
    const config = staticConfig.get(field.id);

    draft[field.id] = {
      visible: config?.visible ?? true,
      required: config?.required ?? false,
      metadata: {
        maxSize: MAX_ATTACHMENT_UPLOAD_SIZE,
        ...config,
      },
    };
  }

  for (const field of form.fields) {
    evaluateConditionalActions(field.actions, values, actions, draft);
  }

  return draft;
}

export async function createFormStore(src: string, options: CreateFormOptions) {
  const form = parseDSL(src);

  const initialValues: Values = {
    ...form.defaultValues,
    ...options.defaultValues,
  };

  const actionRegistry: ActionRegistry = {
    ...defaultActions,
    ...options.actions,
  };

  const { fields, values } = await createInitialFields(
    form,
    initialValues,
    options?.resolveAttachment,
  );

  const elements = form.fields;

  return createStore<FormState>(
    (set, get): FormState => ({
      form,
      values,
      fields,
      elements,
      errors: {},
      isSubmitting: false,

      setValue: (fieldId, value): void => {
        set((state) => {
          const values: Values = {
            ...state.values,
            [fieldId]: value,
          };

          const fields = revalidateExpr(form, values, actionRegistry);
          const validation = validateForm(form.fields, fields, values);

          return {
            values,
            fields,
            errors: validation.errors,
          };
        });
      },

      setValues: (values) => {
        set((state) => {
          const nextValues: Values = {
            ...state.values,
            ...values,
          };

          const fields = revalidateExpr(form, nextValues, actionRegistry);
          const validation = validateForm(form.fields, fields, nextValues);

          return {
            values: nextValues,
            fields,
            errors: validation.errors,
          };
        });
      },

      recompute: () => {
        set((state) => {
          const fields = revalidateExpr(form, state.values, actionRegistry);
          const validation = validateForm(form.fields, fields, state.values);

          return {
            fields,
            errors: validation.errors,
          };
        });
      },

      validate: () => {
        const state = get();

        const validation = validateForm(
          form.fields,
          state.fields,
          state.values,
        );

        set({
          errors: validation.errors,
        });

        return validation.valid;
      },

      submit: async () => {
        const state = get();
        if (!state.validate()) return;
        set({ isSubmitting: true });

        try {
          const uploadFile =
            options.uploadFile ??
            (async () => {
              throw new Error("No file upload provider configured");
            });

          const values = await resolveSubmissionValues(
            state.values,
            uploadFile,
          );

          await options.onSubmit(values);
        } finally {
          set({ isSubmitting: false });
        }
      },
    }),
  );
}

const FormContext = createContext<StoreApi<FormState> | null>(null);

export interface FormProviderProps extends CreateFormOptions {
  src: string;
  children: ReactNode;
}

export function FormProvider({
  src,
  children,
  ...options
}: FormProviderProps): ReactNode {
  const [store, setStore] = useState<StoreApi<FormState> | null>(null);

  useEffect(() => {
    let cancelled = false;

    createFormStore(src, options).then((store: StoreApi<FormState>) => {
      if (!cancelled) {
        setStore(store);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!store) {
    return null;
  }

  return <FormContext.Provider value={store}>{children}</FormContext.Provider>;
}

export function useFormStore<T>(selector: (state: FormState) => T): T {
  const store: StoreApi<FormState> | null = useContext(FormContext);

  if (!store) {
    throw new Error("useFormStore must be used inside FormProvider");
  }

  return useStore(store, selector);
}

export function useForm() {
  return useFormStore((state) => state);
}

export function useFieldValue<T = unknown>(fieldId: string): T {
  return useFormStore((state) => state.values[fieldId] as T);
}

export function useFieldState(fieldId: string) {
  return useFormStore((state) => state.fields[fieldId]);
}

export function useFieldError(fieldId: string): string | undefined {
  return useFormStore((state) => state.errors[fieldId]);
}

export function useSetFieldValue() {
  return useFormStore((state) => state.setValue);
}

export function useDescription() {
  return useFormStore((state) => state.form.description);
}
