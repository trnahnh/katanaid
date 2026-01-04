import { buttonVariants } from "@/components/ui/button";
import { cn } from "../../lib/utils";
import {
  ArrowRightIcon,
  KeyRoundIcon,
  SparklesIcon,
  SwordIcon,
  CodeIcon,
} from "lucide-react";
import type { ReactNode } from "react";

export const CARDS = [
  {
    Icon: CodeIcon,
    name: "Drop-in Components",
    description: "React, Vue Components, multiple frameworks supported and counting.",
    href: "#",
    cta: "Quick start",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating component tags */}
        <div className="absolute top-8 left-6 right-6 transition-all duration-500 ease-out group-hover:translate-y-[-8px]">
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/10 backdrop-blur-sm">
              <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
                <KeyRoundIcon className="w-3 h-3 text-foreground/50" />
              </div>
              <code className="text-[14px] text-foreground/70 font-mono">&lt;KatanaLogin /&gt;</code>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/10 backdrop-blur-sm ml-2">
              <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
                <SwordIcon className="w-3 h-3 text-foreground/50" />
              </div>
              <code className="text-[14px] text-foreground/70 font-mono">&lt;KatanaCaptcha /&gt;</code>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/10 backdrop-blur-sm">
              <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
                <SparklesIcon className="w-3 h-3 text-foreground/50" />
              </div>
              <code className="text-[14px] text-foreground/70 font-mono">&lt;KatanaAvatar /&gt;</code>
            </div>
          </div>
        </div>
        {/* Subtle glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-white/[0.02] rounded-full blur-3xl" />
      </div>
    ),
  },
  {
    Icon: KeyRoundIcon,
    name: "Authentication",
    description: "Social Login (OAuth), Email verification, OTP, Sessions. All handled for you.",
    href: "#",
    cta: "View docs",
    className: "col-span-3 lg:col-span-2",
    background: (
      <div className="absolute inset-0 overflow-hidden">
        {/* Auth card mockup */}
        <div className="absolute top-8 right-8 w-[280px] transition-all duration-500 ease-out group-hover:translate-x-[-12px] group-hover:rotate-[-1deg]">
          <div className="rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-transparent p-5 backdrop-blur-xl shadow-2xl shadow-black/20">
            {/* Mini logo */}
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                <span className="text-foreground/80 text-xs font-bold">K</span>
              </div>
              <span className="text-sm font-medium text-foreground/80">Sign in</span>
            </div>
            {/* OAuth buttons */}
            <div className="space-y-2 mb-4">
              <button className="w-full flex items-center justify-center gap-2 h-9 rounded-lg bg-white/[0.05] border border-white/10 hover:bg-white/10 transition-colors">
                <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                <span className="text-xs text-foreground/70">Google</span>
              </button>
              <button className="w-full flex items-center justify-center gap-2 h-9 rounded-lg bg-white/[0.05] border border-white/10 hover:bg-white/10 transition-colors">
                <svg className="w-4 h-4 text-foreground/70" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                <span className="text-xs text-foreground/70">GitHub</span>
              </button>
            </div>
            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <div className="relative flex justify-center"><span className="px-2 bg-background/50 text-[10px] text-muted-foreground">or continue with email</span></div>
            </div>
            {/* Email input */}
            <div className="space-y-2">
              <div className="h-9 rounded-lg bg-white/[0.03] border border-white/10 px-3 flex items-center">
                <span className="text-xs text-muted-foreground/50">you@example.com</span>
              </div>
              <div className="h-9 rounded-lg bg-white/10 flex items-center justify-center">
                <span className="text-xs text-foreground/80 font-medium">Continue</span>
              </div>
            </div>
          </div>
        </div>
        {/* Background glow */}
        <div className="absolute top-1/2 right-20 w-40 h-40 bg-white/[0.03] rounded-full blur-3xl" />
        {/* Floating session tokens */}
        <div className="absolute top-16 left-8 opacity-40 group-hover:opacity-60 transition-opacity duration-500">
          <div className="text-[9px] font-mono text-foreground/50 bg-white/[0.05] px-2 py-1 rounded border border-white/10">
            ✓ session_active
          </div>
        </div>
        <div className="absolute top-28 left-12 opacity-30 group-hover:opacity-50 transition-opacity duration-500 delay-75">
          <div className="text-[9px] font-mono text-foreground/40 bg-white/[0.03] px-2 py-1 rounded border border-white/10">
            jwt: eyJhb...
          </div>
        </div>
      </div>
    ),
  },
  {
    Icon: SwordIcon,
    name: "Spam Prevention",
    description: "Unique and Fun CAPTCHA. Trial abuse, Spam account Prevention. Keep you serving unique and valuable customers.",
    href: "#",
    cta: "Try it",
    className: "col-span-3 lg:col-span-2",
    background: (
      <div className="absolute inset-0 overflow-hidden">
        {/* CAPTCHA widget */}
        <div className="absolute top-8 left-8 w-[260px] transition-all duration-500 ease-out group-hover:translate-y-[-4px]">
          <div className="rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-4 backdrop-blur-xl">
            {/* Slash zone */}
            <div className="relative h-24 rounded-lg bg-gradient-to-b from-white/[0.02] to-transparent border border-white/5 flex items-center justify-center overflow-hidden">
              {/* Grid pattern */}
              <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '16px 16px'}} />

              {/* The slash */}
              <div className="absolute w-full h-full flex items-center justify-center">
                <div className="relative">
                  {/* Slash trail glow */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-8 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-md transform -rotate-[25deg]" />
                  {/* Main slash */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-[2px] bg-gradient-to-r from-transparent via-white/90 to-transparent transform -rotate-[25deg] shadow-[0_0_12px_rgba(255,255,255,0.4)]" />
                  {/* Slash particles */}
                  <div className="absolute top-1/2 left-[60%] w-1 h-1 bg-white/60 rounded-full animate-ping" />
                  <div className="absolute top-[40%] left-[70%] w-0.5 h-0.5 bg-white/40 rounded-full" />
                </div>
              </div>

              {/* Corner accents */}
              <div className="absolute top-2 left-2 w-3 h-3 border-l border-t border-white/20" />
              <div className="absolute top-2 right-2 w-3 h-3 border-r border-t border-white/20" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-l border-b border-white/20" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-r border-b border-white/20" />
            </div>

            {/* Status bar */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-foreground/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <span className="text-xs text-foreground/80 font-medium">Human</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <SwordIcon className="w-3 h-3" />
                <span>KatanaID</span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk score floating */}
        <div className="absolute bottom-20 right-12 opacity-60 group-hover:opacity-90 transition-all duration-500 group-hover:translate-x-[-8px]">
          <div className="rounded-lg border border-white/10 bg-black/40 backdrop-blur-sm p-3">
            <div className="text-[10px] text-muted-foreground mb-1">Risk Score</div>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold text-foreground/90">0.02</span>
              <span className="text-[10px] text-foreground/50 mb-1">LOW</span>
            </div>
            <div className="w-full h-1 rounded-full bg-white/10 mt-2 overflow-hidden">
              <div className="w-[2%] h-full bg-white/50 rounded-full" />
            </div>
          </div>
        </div>

        {/* Background glow */}
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/[0.03] rounded-full blur-3xl" />
      </div>
    ),
  },
  {
    Icon: SparklesIcon,
    name: "AI Identity Helper",
    description: "Generated avatars. Smart usernames. Every onboarding feels fresh.",
    className: "col-span-3 lg:col-span-1",
    href: "#",
    cta: "See styles",
    background: (
      <div className="absolute inset-0 overflow-hidden">
        {/* Avatar showcase */}
        <div className="absolute top-8 left-0 right-0 flex justify-center transition-all duration-500 group-hover:scale-105">
          <div className="relative">
            {/* Central avatar - larger */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 shadow-xl shadow-black/20 ring-2 ring-white/10 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="w-8 h-8 rounded-full bg-white/15 absolute top-2" />
              <div className="w-10 h-6 rounded-full bg-white/15 absolute bottom-0 translate-y-2" />
            </div>
            {/* Orbiting avatars */}
            <div className="absolute -left-8 top-1 w-10 h-10 rounded-xl bg-gradient-to-br from-white/15 to-white/5 shadow-lg shadow-black/10 ring-1 ring-white/10 -rotate-6" />
            <div className="absolute -right-7 top-2 w-9 h-9 rounded-xl bg-gradient-to-br from-white/10 to-white/5 shadow-lg shadow-black/10 ring-1 ring-white/10 rotate-6" />
            <div className="absolute -left-4 -bottom-4 w-8 h-8 rounded-lg bg-gradient-to-br from-white/15 to-white/5 shadow-lg shadow-black/10 ring-1 ring-white/10 rotate-12" />
            <div className="absolute -right-3 -bottom-3 w-7 h-7 rounded-lg bg-gradient-to-br from-white/10 to-white/5 shadow-lg shadow-black/10 ring-1 ring-white/10 -rotate-12" />

            {/* Sparkle effects */}
            <div className="absolute -top-2 -right-6 size-5">
              <SparklesIcon className="w-full h-full text-white/40" />
            </div>
            <div className="absolute -bottom-1 -left-9 size-5">
              <SparklesIcon className="w-full h-full text-white/30" />
            </div>
          </div>
        </div>

        {/* Username suggestions */}
        <div className="absolute bottom-42 left-4 right-4 transition-all duration-500 group-hover:translate-y-[-4px]">
          <div className="text-[12px] text-muted-foreground mb-2 flex items-center gap-1">
            <SparklesIcon className="size-5" />
            <span>Suggested handles</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-foreground/80 text-[11px] font-medium">@stellar.nova</span>
            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-foreground/60 text-[11px]">@cosmicray</span>
            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-foreground/60 text-[11px]">@nebula_x</span>
          </div>
        </div>

        {/* Background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-24 h-24 bg-white/[0.03] rounded-full blur-3xl" />
      </div>
    ),
  },
];

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[22rem] grid-cols-3 gap-4",
        className
      )}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
}: {
  name: string;
  className: string;
  background?: ReactNode;
  Icon: any;
  description: string;
  href: string;
  cta: string;
}) => (
  <div
    key={name}
    className={cn(
      "group relative col-span-3 flex flex-col justify-between border border-border/80 overflow-hidden rounded-xl",
      "bg-card/80 shadow-[0_-90px_120px_-90px_theme(colors.purple.900/15%)_inset,0_90px_120px_-90px_theme(colors.black/10%)_inset]",
      className
    )}
  >
    <div>{background}</div>
    <div className="pointer-events-none z-10 flex flex-col gap-1 p-6 transition-all duration-300 group-hover:-translate-y-10">
      <Icon className="h-12 w-12 origin-left text-muted-foreground/50 transition-all duration-300 ease-in-out group-hover:scale-75" />
      <h3 className="text-xl font-semibold text-foreground/90">{name}</h3>
      <p className="max-w-lg text-muted-foreground">{description}</p>
    </div>

    <div
      className={cn(
        "absolute bottom-0 flex w-full translate-y-10 flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
      )}
    >
      <a
        href={href}
        className={buttonVariants({
          size: "sm",
          variant: "ghost",
          className: "cursor-pointer",
        })}
      >
        {cta}
        <ArrowRightIcon className="ml-2 h-4 w-4" />
      </a>
    </div>
    <div className="pointer-events-none absolute inset-0 transition-all duration-300 group-hover:bg-foreground/[.03]" />
  </div>
);

export { BentoCard, BentoGrid };
