import { Button } from "@/components/ui/button";
import { components } from "@/dsl-runtime/fields";
import {
  FormProvider,
  useDescription,
  useFormStore,
} from "@/dsl-runtime/form-context";
import { ComponentRegistry, FormProps } from "@/dsl-runtime/types";
import { usePaginateForm } from "@/dsl-runtime/use-paginate";

const FormBody = ({
  onBack,
  components,
}: {
  onBack?: () => void;
  components: ComponentRegistry;
}) => {
  const {
    fields,
    pageIndex,
    pageCount,
    hasNext,
    hasPrevious,
    isLastPage,
    goNext,
    goBack,
    showAll,
  } = usePaginateForm({
    components,
    pageSize: 10,
  });

  const description = useDescription();

  const submit = useFormStore((state) => state.submit);
  const setValue = useFormStore((state) => state.setValue);
  const validate = useFormStore((state) => state.validate);
  const isSubmitting = useFormStore((state) => state.isSubmitting);

  const hasErrors = useFormStore(
    (state) => Object.keys(state.errors).length > 0,
  );

  const handleNext = (): void => {
    if (!hasNext) {
      return;
    }

    goNext();
  };

  const handleBack = (): void => {
    if (hasPrevious) {
      goBack();
      return;
    }

    onBack?.();
  };

  const handleSubmit = async (): Promise<void> => {
    const valid = validate();

    if (!valid) {
      showAll();
      return;
    }

    await submit();
  };

  return (
    <form
      className="flex h-full flex-col"
      onSubmit={async (event) => {
        event.preventDefault();

        if (isLastPage) {
          await handleSubmit();
          return;
        }

        handleNext();
      }}
    >
      <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
        Participant information
      </h2>

      {description?.length ? (
        <p className="mt-2 mb-6 text-sm text-ink/60">{description}</p>
      ) : (
        <p className="mt-2 mb-6 text-sm text-ink/60">
          Configured by the organizers — everything is saved as you move between
          pages.
        </p>
      )}

      <div className="flex items-center justify-between gap-4">
        <div />

        {pageCount > 1 && (
          <span className="shrink-0 rounded-full border border-sand bg-white/60 px-2.5 py-1 text-[11px] font-semibold text-ink/50">
            Page {pageIndex + 1} of {pageCount}
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">{fields}</div>

      <div className="mt-auto mb-5 flex items-center gap-3 pt-6">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="px-5 py-3"
          onClick={handleBack}
          disabled={isSubmitting}
        >
          Back
        </Button>

        {isLastPage ? (
          <Button
            type="submit"
            className="flex-1"
            disabled={isSubmitting || hasErrors}
          >
            {isSubmitting ? "Saving…" : "Continue"}
          </Button>
        ) : (
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            Next
          </Button>
        )}
      </div>
    </form>
  );
};

export const ParticipantForm = (props: FormProps) => {
  return (
    <FormProvider
      src={props.src}
      actions={props.actions}
      uploadFile={props.uploadFile}
      onSubmit={props.onSubmit}
      defaultValues={props.defaultValues ?? {}}
      resolveAttachment={props.getFile}
    >
      <FormBody components={components} onBack={props.onBack} />
    </FormProvider>
  );
};
