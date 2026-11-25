import React from "react"
import { cn } from "@/lib/utils"

export interface BrandLogoProps extends React.SVGProps<SVGSVGElement> {
  /**
   * "light" = dark mark on light surface
   * "dark"  = light mark on dark/black surface
   * "auto"  = responds to Tailwind dark: variant automatically
   */
  variant?: "auto" | "light" | "dark"
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  circleColor?: string
}

const VARIANT_CLASSES = {
  auto: {
    primary: "fill-[#1A1A1A] dark:fill-[#F2F2F2]",
    accent: "fill-[#CCCCCC] dark:fill-[#999999]",
    secondary: "fill-[#999999] dark:fill-[#B8B8B8]",
    circle: "fill-[#CCCCCC] dark:fill-[#0A0A0A]",
  },
  light: {
    primary: "fill-[#1A1A1A]",
    accent: "fill-[#CCCCCC]",
    secondary: "fill-[#999999]",
    circle: "fill-[#CCCCCC]",
  },
  dark: {
    primary: "fill-[#F2F2F2]",
    accent: "fill-[#999999]",
    secondary: "fill-[#B8B8B8]",
    circle: "fill-[#0A0A0A]",
  },
} as const

export function BrandLogo({
  variant = "auto",
  primaryColor,
  secondaryColor,
  accentColor,
  circleColor,
  className,
  ...props
}: BrandLogoProps) {
  const palette = VARIANT_CLASSES[variant]

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 232.454 173.313"
      aria-label="Abdullah Al Maksud Logo"
      role="img"
      className={cn("h-6 w-auto shrink-0", className)}
      {...props}
    >
      <path
        d="M0 173.313 L100.062 0 L138.6 66.75 L118.961 100.766 C118.085 103.536 116.616 106.043 114.704 108.138 L77.076 173.313 Z"
        className={primaryColor ? undefined : palette.primary}
        style={primaryColor ? { fill: primaryColor } : undefined}
      />
      <polygon
        points="100.062,0 139.697,0 158.418,32.425 138.6,66.75"
        className={accentColor ? undefined : palette.accent}
        style={accentColor ? { fill: accentColor } : undefined}
      />
      <path
        d="M138.6 66.75 L158.418 32.425 L231.099 158.313 C234.948 164.979 230.137 173.313 222.439 173.313 L200.124 173.313 Z"
        className={secondaryColor ? undefined : palette.secondary}
        style={secondaryColor ? { fill: secondaryColor } : undefined}
      />
      <path
        d="M100.062 68.852 C114.195 68.852 125.651 80.309 125.651 94.442 C125.651 97.246 125.2 99.945 124.367 102.47 C123.26 105.823 121.479 108.869 119.183 111.448 C114.496 116.714 107.667 120.031 100.062 120.031 C85.93 120.031 74.473 108.574 74.473 94.442 C74.473 80.309 85.93 68.852 100.062 68.852 Z"
        className={circleColor ? undefined : palette.circle}
        style={circleColor ? { fill: circleColor } : undefined}
      />
      <path
        d="M118.885 100.897 L138.6 66.75 L200.124 173.313 L77.076 173.313 L114.87 107.851 C116.648 105.853 118.028 103.494 118.885 100.897 Z"
        className={secondaryColor ? undefined : palette.secondary}
        style={secondaryColor ? { fill: secondaryColor } : undefined}
      />
    </svg>
  )
}
