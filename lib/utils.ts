import { type ClassValue, clsx } from "clsx";
// @ts-expect-error - no type
import getExtName from "ext-name";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getFileExtension(fileName: string): string | null {
  const extension: string | undefined = fileName.split(".").pop();

  if (!extension || extension === fileName) {
    return null;
  }

  return extension.toUpperCase();
}


export function parseSize(value: string): number {
  const match: RegExpMatchArray | null = value
    .trim()
    .match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)$/i);

  if (!match) {
    throw new Error(`Invalid file size "${value}". Expected e.g. "5MB".`);
  }

  const amount: number = Number(match[1]);
  const unit: string = match[2].toUpperCase();

  const multipliers: Record<string, number> = {
    B: 1,
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
  };

  return amount * multipliers[unit];
}

export function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes";

  const units = ["Bytes", "KB", "MB", "GB", "TB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, index);

  return `${parseFloat(value.toFixed(2))}${units[index]}`;
}

type Ext = {
  ext: string;
  mime: string;
};

type ExtName = (value: string) => Ext[];

export function getExtension<R extends string | null = null>(
  input?: string | File | null,
): R {
  if (!input) return null as R;

  const extName = getExtName as ExtName;

  const resolve = (value: string): R => {
    if (!value) return null as R;

    return (extName(value)[0]?.ext ?? null) as R;
  };

  if (typeof input === "string") {
    return resolve(input.toLowerCase());
  }

  return resolve(input.name.toLowerCase()) ?? resolve(input.type);
}

export function getFilename(path: string = "") {
  const base = path
    .substring(path.lastIndexOf("/") + 1)
    .substring(path.lastIndexOf("\\") + 1);

  const lastDot = base.lastIndexOf(".");

  return lastDot === -1 ? base : base.substring(0, lastDot);
}

export function getHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
