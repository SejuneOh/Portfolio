import type React from "react";

type BadgeProps = { text: string } & React.HTMLAttributes<HTMLSpanElement>;

export default function Badge({ text, ...props }: BadgeProps) {
  return (
    <span {...props} className="chip">
      {text}
    </span>
  );
}
