"use client";

import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.CollapsibleTrigger>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleTrigger> & {
    render?: React.ReactElement;
  }
>(({ render, children, asChild, ...props }, ref) => {
  if (render) {
    return (
      <CollapsiblePrimitive.CollapsibleTrigger asChild ref={ref} {...props}>
        {render}
      </CollapsiblePrimitive.CollapsibleTrigger>
    );
  }
  return (
    <CollapsiblePrimitive.CollapsibleTrigger asChild={asChild} ref={ref} {...props}>
      {children}
    </CollapsiblePrimitive.CollapsibleTrigger>
  );
});
CollapsibleTrigger.displayName = CollapsiblePrimitive.CollapsibleTrigger.displayName;

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
