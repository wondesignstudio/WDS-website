import Image from "next/image";

type BrandLogoProps = {
  variant?: "black" | "white";
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export function BrandLogo({
  variant = "black",
  className,
  priority = false,
  sizes = "(max-width: 720px) 44px, 56px",
}: BrandLogoProps) {
  return (
    <Image
      className={className}
      src={`/brand/wds-logo-${variant}.png`}
      alt=""
      aria-hidden="true"
      width={418}
      height={423}
      priority={priority}
      sizes={sizes}
    />
  );
}
