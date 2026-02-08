
"use client";
import { cn } from "../../lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

interface Links {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

// Fix: Made children optional to avoid TypeScript "missing children" errors in JSX contexts
export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children?: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

// Fix: Made children optional to avoid TypeScript "missing children" errors in JSX contexts
export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children?: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

// Fix: Corrected prop casting for MobileSidebar to avoid type mismatch between motion.div and standard div props
export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as any)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <>
      <motion.div
        className={cn(
          "h-full px-4 py-8 hidden md:flex md:flex-col bg-black border-r border-white/5 shrink-0",
          className
        )}
        animate={{
          width: animate ? (open ? "280px" : "80px") : "280px",
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        {...props}
      >
        {children}
      </motion.div>
    </>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-14 px-6 flex flex-row md:hidden items-center justify-between bg-black border-b border-white/5 w-full fixed top-0 left-0 z-[100]"
        )}
        {...props}
      >
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 border border-[#00ff9c] flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-[#00ff9c]"></div>
          </div>
          <span className="text-xs font-black tracking-tighter uppercase italic">Tradevo</span>
        </div>
        <div className="flex justify-end z-[110]">
          <Menu
            className="text-white w-5 h-5 cursor-pointer"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-black p-10 z-[120] flex flex-col justify-between border-r border-white/10",
                className
              )}
            >
              <div
                className="absolute right-6 top-4 z-[130] text-white cursor-pointer"
                onClick={() => setOpen(!open)}
              >
                <X className="w-6 h-6" />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

// Fix: Support onClick, theme, and other anchor attributes in SidebarLink props
export const SidebarLink = ({
  link,
  className,
  active,
  theme,
  ...props
}: {
  link: Links;
  className?: string;
  active?: boolean;
  theme?: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const { open, animate } = useSidebar();
  return (
    <a
      href={link.href}
      className={cn(
        "flex items-center justify-start gap-3 group/sidebar py-3 px-2 rounded-sm transition-all duration-200",
        active 
          ? "bg-[#00ff9c]/10 text-[#00ff9c]" 
          : (theme === 'dark' ? "text-white/40 hover:bg-white/5 hover:text-white" : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"),
        className
      )}
      {...props}
    >
      <div className={cn("transition-colors", active ? "text-[#00ff9c]" : "group-hover/sidebar:text-[#00ff9c]")}>
        {link.icon}
      </div>

      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-[10px] font-black uppercase tracking-[0.2em] transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </a>
  );
};
