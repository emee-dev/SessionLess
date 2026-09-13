import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface EventBranding {
  logoUrl?: string;
  logoLabel?: string;
  backgroundImageUrl?: string;
  fonts?: { display?: string; body?: string };
  colors?: {
    brand?: string;
    brandDeep?: string;
    cream?: string;
    sand?: string;
    ink?: string;
    gold?: string;
    pageGradient?: string;
  };
}

export function Branding({
  branding,
  children,
  className,
}: {
  branding?: EventBranding;
  children: ReactNode;
  className?: string;
}) {
  const colors = branding?.colors;

  const style = {
    "--brand": colors?.brand,
    "--brand-deep": colors?.brandDeep,
    "--cream": colors?.cream,
    "--sand": colors?.sand,
    "--ink": colors?.ink,
    "--gold": colors?.gold,
    "--page-gradient": colors?.pageGradient,
    "--font-display-family": branding?.fonts?.display,
    "--font-body-family": branding?.fonts?.body,
  } as CSSProperties;

  return (
    <div className={cn(className)} style={style}>
      {children}
    </div>
  );
}
