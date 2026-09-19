import { useState } from "react";
import { DEFAULT_PHOTO_PATH } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface AvatarProps {
  name?: string;
  personnelId?: string;
  photoUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-20 w-20 text-xl",
};

export function Avatar({
  name,
  personnelId,
  photoUrl,
  size = "md",
  className,
}: AvatarProps) {
  const [errored, setErrored] = useState(false);
  const src = photoUrl && !errored ? photoUrl : DEFAULT_PHOTO_PATH;

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-app-accent/30 bg-app-input",
        sizes[size],
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name ?? personnelId ?? "avatar"}
        className="h-full w-full object-cover"
        onError={() => setErrored(true)}
      />
    </div>
  );
}