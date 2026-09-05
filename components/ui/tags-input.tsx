"use client";

import { Trash2, X } from "lucide-react";
import { KeyboardEventHandler, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type TagsInputProps = {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  disabled?: boolean;
  className?: string;
};

export default function TagsInput({
  tags = [],
  onTagsChange,
  placeholder = "Add a tag...",
  maxTags,
  disabled = false,
  className,
}: TagsInputProps) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const commitDraft = () => {
    const value = draft.trim();
    if (!value) return;
    if (tags.includes(value)) {
      setDraft("");
      return;
    }
    if (maxTags && tags.length >= maxTags) {
      setDraft("");
      return;
    }
    onTagsChange([...tags, value]);
    setDraft("");
  };

  const removeTag = (index: number) => {
    onTagsChange(tags.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    onTagsChange([]);
    setDraft("");
    inputRef.current?.focus();
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitDraft();
    } else if (e.key === "Backspace" && draft === "" && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const atMax = maxTags ? tags.length >= maxTags : false;

  return (
    <div className={cn("w-full max-w-md space-y-1.5", className)}>
      <div
        className={cn(
          "flex h-8 w-full min-w-0 items-center gap-1 rounded-none border border-input bg-transparent px-1.5 text-xs transition-colors outline-none",
          "focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50",
          "dark:bg-input/30",
          disabled &&
            "pointer-events-none cursor-not-allowed bg-input/50 opacity-50 dark:bg-input/80",
          tags.length > 0 && "flex-wrap h-auto min-h-8 py-1",
          className,
        )}
        onClick={() => !disabled && inputRef.current?.focus()}
      >
        {tags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="inline-flex h-5 items-center gap-1 bg-secondary pl-1.5 pr-1 text-xs font-medium text-secondary-foreground rounded-sm"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(index);
                }}
                className="inline-flex size-3.5 items-center justify-center rounded-none text-secondary-foreground/60 outline-none transition-colors hover:text-secondary-foreground focus-visible:text-secondary-foreground"
                aria-label={`Remove ${tag}`}
              >
                <X className="size-3" />
              </button>
            )}
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitDraft}
          disabled={disabled || atMax}
          placeholder={
            tags.length === 0 ? placeholder : atMax ? "Max tags reached" : ""
          }
          className="h-6 px-1.5 min-w-[60px] flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        />

        {tags.length > 0 && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={(e) => {
              e.stopPropagation();
              clearAll();
            }}
            aria-label="Clear all tags"
            title="Clear all tags"
            className="ml-auto rounded-sm shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 />
          </Button>
        )}
      </div>

      {maxTags && (
        <p className="text-xs text-muted-foreground">
          {tags.length}/{maxTags} tags
        </p>
      )}
    </div>
  );
}
