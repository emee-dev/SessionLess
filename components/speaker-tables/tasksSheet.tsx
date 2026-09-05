"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import * as React from "react";
import { Requirement } from "@/components/organizer-tables/tasksColumn";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";

type Task = Doc<"eventTasks">;

type TaskResponseValue = {
  id: string;
  type: Requirement["type"];
  label: string;
  value: string | boolean;
};

type TaskFormValues = {
  values: TaskResponseValue[];
};

type CompleteTaskProps = {
  task: Task;
  response?: {
    values: TaskResponseValue[];
    isComplete: boolean;
  };
};

export function CompleteTask({
  task,
  response,
}: CompleteTaskProps): React.ReactElement {
  const completeTask = useMutation(api.tasks.completeTask);
  const [open, setOpen] = React.useState<boolean>(false);

  const initialValues: TaskFormValues = React.useMemo(() => {
    const existingValues: TaskResponseValue[] = response?.values ?? [];

    return {
      values: task.requirements.map((requirement): TaskResponseValue => {
        const existingValue: TaskResponseValue | undefined =
          existingValues.find(
            (value: TaskResponseValue) => value.id === requirement.id,
          );

        if (existingValue) {
          return existingValue;
        }

        return {
          id: requirement.id,
          type: requirement.type,
          label: requirement.label,
          value: requirement.type === "checkbox" ? false : "",
        };
      }),
    };
  }, [task.requirements, response?.values]);

  const form = useForm({
    defaultValues: initialValues,

    onSubmit: async ({ value }): Promise<void> => {
      await completeTask({
        eventTaskId: task._id,
        values: value.values,
        isComplete: true,
      });

      setOpen(false);
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset(initialValues);
    }
  }, [open, initialValues, form]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" size="sm">
            Complete task
          </Button>
        }
      />

      <SheetContent className="flex w-full flex-col sm:max-w-2xl">
        <SheetHeader className="px-6 pt-6">
          <SheetTitle>{task.name}</SheetTitle>

          <SheetDescription>
            Provide the information requested below to complete this task.
            Required fields must be completed before you can submit.
          </SheetDescription>
        </SheetHeader>

        <form
          id="complete-task-form"
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            event.stopPropagation();

            void form.handleSubmit();
          }}
        >
          <div className="h-[420px] overflow-y-auto px-6 py-6 thin-scrollbar">
            {task.requirements.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  This task does not have any requirements.
                </p>
              </div>
            ) : (
              <FieldGroup className="gap-5">
                {task.requirements

                  .sort((a, b) => {
                    const getPriority = (item: Requirement): number => {
                      if (item.type === "text") {
                        return item.required ? 0 : 1;
                      }

                      return item.required ? 2 : 3;
                    };

                    return getPriority(a) - getPriority(b);
                  })
                  .map((requirement: Requirement, index: number) => (
                    <form.Field
                      key={requirement.id}
                      name={`values[${index}].value`}
                      validators={{
                        onSubmit: ({ value }): string | undefined => {
                          if (!requirement.required) {
                            return undefined;
                          }

                          if (requirement.type === "checkbox") {
                            return value === true
                              ? undefined
                              : "You must confirm this requirement.";
                          }

                          if (
                            typeof value !== "string" ||
                            value.trim().length === 0
                          ) {
                            return "This field is required.";
                          }

                          return undefined;
                        },
                      }}
                    >
                      {(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid;

                        if (requirement.type === "checkbox") {
                          return (
                            <Field data-invalid={isInvalid}>
                              <div className="flex items-center gap-x-2.5">
                                <Checkbox
                                  id={field.name}
                                  name={field.name}
                                  checked={field.state.value === true}
                                  onCheckedChange={(checked: boolean) => {
                                    field.handleChange(checked);
                                  }}
                                  onBlur={field.handleBlur}
                                  aria-invalid={isInvalid}
                                  className="rounded-sm"
                                />
                                <FieldLabel
                                  htmlFor={field.name}
                                  className="font-normal"
                                >
                                  {requirement.label}

                                  {requirement.required && (
                                    <span className="text-destructive">*</span>
                                  )}
                                </FieldLabel>
                              </div>

                              {isInvalid && (
                                <FieldError
                                  errors={field.state.meta.errors.map(
                                    (message) => ({
                                      message,
                                    }),
                                  )}
                                />
                              )}
                            </Field>
                          );
                        }

                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              {requirement.label}
                              {requirement.required && (
                                <span className="text-destructive">*</span>
                              )}
                            </FieldLabel>

                            <Input
                              id={field.name}
                              name={field.name}
                              value={
                                typeof field.state.value === "string"
                                  ? field.state.value
                                  : ""
                              }
                              onBlur={field.handleBlur}
                              onChange={(
                                event: React.ChangeEvent<HTMLInputElement>,
                              ) => {
                                field.handleChange(event.target.value);
                              }}
                              aria-invalid={isInvalid}
                              placeholder="Enter your response"
                              className="rounded-md"
                            />

                            {isInvalid && (
                              <FieldError
                                errors={field.state.meta.errors.map(
                                  (message) => ({
                                    message,
                                  }),
                                )}
                              />
                            )}
                          </Field>
                        );
                      }}
                    </form.Field>
                  ))}
              </FieldGroup>
            )}
          </div>

          <SheetFooter className="border-t px-6 py-4">
            <SheetClose
              render={
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              }
            />

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? "Completing..." : "Complete task"}
                </Button>
              )}
            </form.Subscribe>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
