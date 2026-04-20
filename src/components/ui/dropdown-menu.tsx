"use client";

import * as React from "react";
import {cn} from "@/lib/utils";

const DropdownMenuContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
} | null>(null);

function useDropdownMenu() {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error("DropdownMenu components must be used within a DropdownMenu");
  }
  return context;
}

interface DropdownMenuProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function DropdownMenu({children, open: controlledOpen, onOpenChange}: DropdownMenuProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  return (
    <DropdownMenuContext.Provider value={{open, onOpenChange: setOpen}}>
      <div className="relative">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

function DropdownMenuTrigger({children, asChild}: {children: React.ReactNode; asChild?: boolean}) {
  const {onOpenChange} = useDropdownMenu();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{onClick?: () => void}>, {
      onClick: () => onOpenChange(true),
    });
  }

  return <button onClick={() => onOpenChange(true)}>{children}</button>;
}

function DropdownMenuContent({children, align = "end", className}: {
  children: React.ReactNode;
  align?: "start" | "end";
  className?: string;
}) {
  const {open, onOpenChange} = useDropdownMenu();

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50" onClick={() => onOpenChange(false)} />
      <div
        className={cn(
          "absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-background p-1 shadow-md animate-in fade-in-100 zoom-in-95",
          align === "end" ? "right-0" : "left-0",
          className
        )}
      >
        {children}
      </div>
    </>
  );
}

function DropdownMenuItem({children, className, onClick, asChild, ...props}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  asChild?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{onClick?: () => void; className?: string}>, {
      onClick: () => { onClick?.(); },
      className: cn("relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-muted focus:bg-muted", (children as React.ReactElement<{className?: string}>).props?.className, className),
    });
  }
  return (
    <button
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-muted focus:bg-muted",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
};