"use client";

import { useMutation } from "convex/react";
import { FunctionArgs } from "convex/server";
import { Folder, Plus, Shapes, SquareCheck, Text, Trash2 } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Id } from "@/convex/_generated/dataModel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Requirement } from "./tasksColumn";

function createRequirement(type: Requirement["type"]): Requirement {
  return {
    id: crypto.randomUUID(),
    type,
    label: "",
    required: false,
  };
}

export type NewTask = FunctionArgs<typeof api.tasks.createEventTask>;

type CreateTaskProps = {
  eventId: string;
  variant?: "default" | "outline";
};

type TaskFormValues = {
  name: string;
  requirements: Requirement[];
};

type TaskFormProps = {
  values: TaskFormValues;
  isSaving: boolean;
  submitLabel: string;
  onSubmit: (values: TaskFormValues) => void | Promise<void>;
};

export type UpdateTask = FunctionArgs<typeof api.tasks.updateEventTask>;

type EditTasksProps = {
  task: UpdateTask;
};

function useTaskForm(initialValues: TaskFormValues) {
  const [name, setName] = React.useState<string>(initialValues.name);
  const [requirements, setRequirements] = React.useState<Requirement[]>(
    initialValues.requirements,
  );

  const addRequirement = React.useCallback(
    (type: Requirement["type"]): void => {
      setRequirements((current: Requirement[]) => [
        ...current,
        createRequirement(type),
      ]);
    },
    [],
  );

  const removeRequirement = React.useCallback((requirementId: string): void => {
    setRequirements((current: Requirement[]) =>
      current.filter(
        (requirement: Requirement) => requirement.id !== requirementId,
      ),
    );
  }, []);

  const updateRequirement = React.useCallback(
    (requirementId: string, updates: Partial<Requirement>): void => {
      setRequirements((current: Requirement[]) =>
        current.map((requirement: Requirement) =>
          requirement.id === requirementId
            ? { ...requirement, ...updates }
            : requirement,
        ),
      );
    },
    [],
  );

  const reset = React.useCallback((values: TaskFormValues): void => {
    setName(values.name);
    setRequirements(values.requirements);
  }, []);

  return {
    name,
    setName,
    requirements,
    addRequirement,
    removeRequirement,
    updateRequirement,
    reset,
  };
}

function TaskForm({
  values,
  isSaving,
  submitLabel,
  onSubmit,
}: TaskFormProps): React.ReactElement {
  const {
    name,
    setName,
    requirements,
    addRequirement,
    removeRequirement,
    updateRequirement,
  } = useTaskForm(values);

  const handleSubmit = async (): Promise<void> => {
    const trimmedName: string = name.trim();

    if (!trimmedName) {
      return;
    }

    await onSubmit({
      name: trimmedName,
      requirements,
    });
  };

  return (
    <>
      <div className="flex-1 overflow-y-autox px-4 py-6 thin-scrollbarx">
        <div className="grid gap-6">
          {/* Task name */}
          <div className="grid gap-3">
            <Label htmlFor="task-name">Task name</Label>

            <Input
              id="task-name"
              value={name}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setName(event.target.value)
              }
              placeholder="e.g. Complete speaker profile"
              autoFocus
              className="rounded-lg"
            />
          </div>

          {/* Requirements */}
          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-4">
              <Label>Requirements</Label>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                    >
                      <Plus />
                      Add requirement
                    </Button>
                  }
                />

                <DropdownMenuContent align="end" className="w-64 rounded-lg">
                  <DropdownMenuItem
                    onClick={() => addRequirement("text")}
                    className="items-start gap-2.5"
                  >
                    <Text className="mt-0.5 size-4" />

                    <div className="grid gap-0.5">
                      <span>Text</span>
                      <span className="text-xs text-muted-foreground">
                        Ask speakers to provide text
                      </span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => addRequirement("checkbox")}
                    className="items-start gap-2.5"
                  >
                    <Shapes className="mt-0.5 size-4" />

                    <div className="grid gap-0.5">
                      <span>Checkbox</span>
                      <span className="text-xs text-muted-foreground">
                        Speaker confirmation
                      </span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {requirements.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Folder />
                  </EmptyMedia>

                  <EmptyTitle>No requirements yet</EmptyTitle>

                  <EmptyDescription>
                    Define what Speakers need to complete
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="max-h-77.5 overflow-y-auto thin-scrollbar">
                <div className="grid gap-">
                  {requirements.map(
                    (requirement: Requirement): React.ReactElement => (
                      <div
                        key={requirement.id}
                        className="grid rounded-sm gap-y-1.5 border bg-card p-2"
                      >
                        <div className="flex items-start gap-x-2.5">
                          <div className="mt-2 shrink-0 text-muted-foreground">
                            <Text className="size-4" />
                          </div>

                          <Input
                            value={requirement.label}
                            onChange={(
                              event: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                              updateRequirement(requirement.id, {
                                label: event.target.value,
                              })
                            }
                            placeholder={
                              requirement.type === "text"
                                ? "e.g. What are your dietary requirements?"
                                : "e.g. Are okay sleeping on the floor?"
                            }
                            className="rounded-lg"
                          />
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <Label className="flex items-center gap-x-2 text-sm">
                            <Checkbox
                              checked={requirement.required}
                              onCheckedChange={(checked: boolean) =>
                                updateRequirement(requirement.id, {
                                  required: checked,
                                })
                              }
                              className="rounded-xs"
                            />
                            Required
                          </Label>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="shrink-0 text-muted-foreground rounded-lg"
                            onClick={() => removeRequirement(requirement.id)}
                            aria-label={`Remove ${
                              requirement.label || "requirement"
                            }`}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <SheetFooter>
        <SheetClose
          render={
            <Button variant="outline" disabled={isSaving}>
              Cancel
            </Button>
          }
        />

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving || !name.trim()}
        >
          {isSaving ? "Saving..." : submitLabel}
        </Button>
      </SheetFooter>
    </>
  );
}

export function CreateTasks({
  eventId,
  variant = "outline",
}: CreateTaskProps): React.ReactElement {
  const createTask = useMutation(api.tasks.createEventTask);
  const [open, setOpen] = React.useState<boolean>(false);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);

  const handleSubmit = async ({
    name,
    requirements,
  }: TaskFormValues): Promise<void> => {
    setIsSaving(true);

    try {
      const payload: NewTask = {
        name,
        eventId: eventId as Id<"events">,
        requirements,
      };

      await createTask(payload);
      setOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant={variant}>Create task</Button>} />

      <SheetContent className="sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Create task</SheetTitle>

          <SheetDescription>
            Create a task and define the information participants need to
            provide.
          </SheetDescription>
        </SheetHeader>

        <TaskForm
          values={{
            name: "",
            requirements: [],
          }}
          isSaving={isSaving}
          submitLabel="Create task"
          onSubmit={handleSubmit}
        />
      </SheetContent>
    </Sheet>
  );
}

export function EditTasks({ task }: EditTasksProps): React.ReactElement {
  const updateEventTask = useMutation(api.tasks.updateEventTask);
  const [open, setOpen] = React.useState<boolean>(false);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);

  const initialValues: TaskFormValues = React.useMemo(
    () => ({
      name: task.name ?? "",
      requirements: task.requirements ?? [],
    }),
    [task],
  );

  const handleSubmit = async ({
    name,
    requirements,
  }: TaskFormValues): Promise<void> => {
    setIsSaving(true);

    try {
      await updateEventTask({
        _id: task._id,
        name,
        requirements,
      });

      setOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" size="sm">
            Edit
          </Button>
        }
      />

      <SheetContent className="sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Edit task</SheetTitle>

          <SheetDescription>
            Update the task and the information Speakers need to provide.
          </SheetDescription>
        </SheetHeader>

        <TaskForm
          values={initialValues}
          isSaving={isSaving}
          submitLabel="Save changes"
          onSubmit={handleSubmit}
        />
      </SheetContent>
    </Sheet>
  );
}
