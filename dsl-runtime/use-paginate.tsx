import { useCallback, useEffect, useRef, useState } from "react";
import { renderFields } from "./fields";
import { useFormStore } from "./form-context";
import { ComponentRegistry, Field } from "./types";

export interface FormPage {
  index: number;
  items: Field[];
  startIndex: number;
  endIndex: number;
}

export interface UsePaginateFormOptions {
  components: ComponentRegistry;
  // items: T[];
  pageSize?: number;

  /**
   * Number of pages initially made available.
   * @default 10
   */
  initialPages?: number;

  /**
   * When true, loadMore() appends another page instead of
   * using explicit next/back navigation.
   */
  infinite?: boolean;

  /**
   * Optional callback when the last page is reached.
   */
  onComplete?: () => void;
  onPageChange?: (pageIndex: number) => void;
}

export interface UsePaginateForm {
  fields: React.ReactNode[];
  page: FormPage | undefined;
  visibleItems: Field[];

  pageIndex: number;
  pageCount: number;

  hasNext: boolean;
  hasPrevious: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;

  canLoadMore: boolean;
  loadedCount: number;
  isFullyLoaded: boolean;

  goNext: () => void;
  goBack: () => void;
  goTo: (pageIndex: number) => void;
  loadMore: () => void;
  reset: () => void;
  showAll: () => void;
}

export function usePaginateForm({
  pageSize = 10,
  initialPages = 1,
  infinite = false,
  components,
  onComplete,
  onPageChange,
}: UsePaginateFormOptions): UsePaginateForm {
  const items = useFormStore((state) => state.elements);

  const pageCount = items.length === 0 ? 0 : Math.ceil(items.length / pageSize);

  const [pageIndex, setPageIndex] = useState(0);
  const [loadedPages, setLoadedPages] = useState(
    infinite ? Math.min(Math.max(1, initialPages), pageCount) : pageCount,
  );

  const previousItems = useRef(items);

  const pages = Array.from(
    {
      length: infinite ? Math.min(loadedPages, pageCount) : pageCount,
    },
    (_, index): FormPage => {
      const startIndex = index * pageSize;
      const endIndex = Math.min(startIndex + pageSize, items.length);

      return {
        index,
        items: items.slice(startIndex, endIndex),
        startIndex,
        endIndex,
      };
    },
  );

  const page = pages[pageIndex];
  const visibleItems = page?.items ?? [];

  const isFirstPage = pageIndex === 0;
  const isLastPage = pageCount === 0 || pageIndex === pageCount - 1;

  const hasNext = !isLastPage;
  const hasPrevious = !isFirstPage;

  const isFullyLoaded = !infinite || loadedPages >= pageCount;

  const canLoadMore = infinite && !isFullyLoaded;

  const loadedCount = infinite
    ? Math.min(loadedPages * pageSize, items.length)
    : items.length;

  /**
   * Keep the active page valid when the item count changes.
   */
  useEffect(() => {
    setPageIndex((current) => Math.min(current, Math.max(0, pageCount - 1)));
  }, [pageCount]);

  /**
   * Reset when the item collection is replaced.
   */
  useEffect(() => {
    if (previousItems.current === items) {
      return;
    }

    previousItems.current = items;
    setPageIndex(0);

    setLoadedPages(
      infinite ? Math.min(Math.max(1, initialPages), pageCount) : pageCount,
    );
  }, [items, infinite, initialPages, pageCount]);

  const loadMore = useCallback(() => {
    if (!infinite) {
      return;
    }

    setLoadedPages((current) => Math.min(current + 1, pageCount));
  }, [infinite, pageCount]);

  const goNext = useCallback(() => {
    if (isLastPage) {
      onComplete?.();
      return;
    }

    const nextIndex = pageIndex + 1;

    if (infinite && nextIndex >= loadedPages) {
      setLoadedPages((current) => Math.min(current + 1, pageCount));
    }

    setPageIndex(nextIndex);
    onPageChange?.(nextIndex);
  }, [
    infinite,
    isLastPage,
    loadedPages,
    pageCount,
    pageIndex,
    onComplete,
    onPageChange,
  ]);

  const goBack = useCallback(() => {
    if (isFirstPage) {
      return;
    }

    const previousIndex = pageIndex - 1;

    setPageIndex(previousIndex);
    onPageChange?.(previousIndex);
  }, [isFirstPage, pageIndex, onPageChange]);

  const goTo = useCallback(
    (index: number) => {
      if (!pageCount) {
        return;
      }

      const nextIndex = Math.max(0, Math.min(index, pageCount - 1));

      if (infinite) {
        setLoadedPages((current) => Math.max(current, nextIndex + 1));
      }

      setPageIndex(nextIndex);
      onPageChange?.(nextIndex);
    },
    [infinite, pageCount, onPageChange],
  );

  const reset = useCallback(() => {
    setPageIndex(0);

    setLoadedPages(
      infinite ? Math.min(Math.max(1, initialPages), pageCount) : pageCount,
    );

    onPageChange?.(0);
  }, [infinite, initialPages, pageCount, onPageChange]);

  /**
   * Ensure the current page is available.
   */
  const showAll = useCallback(() => {
    if (!pageCount || !infinite) {
      return;
    }

    setLoadedPages((current) => Math.max(current, pageIndex + 1));
  }, [infinite, pageCount, pageIndex]);

  return {
    page,
    fields: renderFields((page.items || []) as Field[], components),
    visibleItems,

    pageIndex,
    pageCount,

    hasNext,
    hasPrevious,
    isFirstPage,
    isLastPage,

    canLoadMore,
    loadedCount,
    isFullyLoaded,

    goNext,
    goBack,
    goTo,
    loadMore,
    reset,
    showAll,
  };
}
