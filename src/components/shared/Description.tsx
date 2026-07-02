//@ts-nocheck
import { sanitizeHtml } from "@/utils/sanitize";
import classNames from "classnames";
import React from "react";

export interface DescriptionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  description: string;
}

/**
 * Renders an AniList HTML description. Previously this wrapped a read-only tiptap
 * editor; tiptap has been removed, so it now renders sanitized HTML directly.
 */
const Description = React.forwardRef<HTMLDivElement, DescriptionProps>(
  ({ description, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={classNames(
          "text-base text-gray-300 hover:text-gray-100 [&_a]:text-primary-300 [&_a]:underline",
          className
        )}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(description || "") }}
        {...props}
      />
    );
  }
);

Description.displayName = "Description";

export default Description;
