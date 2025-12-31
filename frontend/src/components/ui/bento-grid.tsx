import { buttonVariants } from "@/components/ui/button";
import { cn } from "../../lib/utils";
import {
  ArrowRightIcon,
  CodeIcon,
  FileTextIcon,
  ScanFaceIcon,
  ShieldIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";

export const CARDS = [
  {
    Icon: ScanFaceIcon,
    name: "Deepfake Detection",
    description: "Upload images, videos, or audio to instantly detect AI-generated manipulation.",
    href: "#",
    cta: "Try it free",
    className: "col-span-3 lg:col-span-1",
    background: (
      <Card className="absolute top-10 left-10 origin-top rounded-none rounded-tl-md transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_0%,#000_100%)] group-hover:scale-105 border border-border border-r-0">
        <CardHeader>
          <CardTitle>Upload media</CardTitle>
          <CardDescription>
            Drag & drop or browse to analyze content.
          </CardDescription>
        </CardHeader>
        <CardContent className="-mt-4">
          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center text-muted-foreground text-sm">
            Drop image, video, or audio
          </div>
        </CardContent>
      </Card>
    ),
  },
  {
    Icon: ShieldIcon,
    name: "Bot Shield",
    description: "Real-time API to block bots and fake accounts from infiltrating your platform.",
    href: "#",
    cta: "View docs",
    className: "col-span-3 lg:col-span-2",
    background: (
      <div className="absolute right-10 top-10 w-[70%] origin-top translate-x-0 border border-border rounded-lg transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] group-hover:-translate-x-10 p-4 bg-black/50">
        <div className="flex items-center gap-2 text-green-500 text-sm mb-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live protection active
        </div>
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between text-neutral-400">
            <span>192.168.1.42</span>
            <span className="text-red-400">Blocked - Bot detected</span>
          </div>
          <div className="flex justify-between text-neutral-400">
            <span>10.0.0.128</span>
            <span className="text-green-400">Verified human</span>
          </div>
          <div className="flex justify-between text-neutral-400">
            <span>172.16.0.89</span>
            <span className="text-red-400">Blocked - Fake account</span>
          </div>
          <div className="flex justify-between text-neutral-400">
            <span>192.168.0.15</span>
            <span className="text-green-400">Verified human</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    Icon: FileTextIcon,
    name: "Content Authenticity",
    description: "Detect AI-written text in reviews, comments, or user submissions.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2 max-w-full overflow-hidden",
    background: (
      <div className="absolute right-10 top-10 w-[80%] origin-top border border-border rounded-lg transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] group-hover:scale-105 p-4 bg-black/50">
        <div className="text-sm text-neutral-300 leading-relaxed">
          <span className="bg-red-500/20 text-red-300 px-1 rounded">This product exceeded my expectations</span> and{" "}
          <span className="bg-red-500/20 text-red-300 px-1 rounded">I would highly recommend it to anyone</span> looking for{" "}
          <span className="bg-red-500/20 text-red-300 px-1 rounded">a quality solution that delivers results</span>.
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span className="text-red-400 font-medium">87% AI-generated</span>
          <span className="text-neutral-500">|</span>
          <span className="text-neutral-400">3 suspicious phrases detected</span>
        </div>
      </div>
    ),
  },
  {
    Icon: CodeIcon,
    name: "Verification API",
    description: "Plug-and-play REST API with SDKs for seamless integration.",
    className: "col-span-3 lg:col-span-1",
    href: "#",
    cta: "Get API key",
    background: (
      <div className="absolute right-4 top-10 left-4 origin-top rounded-md border border-border transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] group-hover:scale-105 p-3 bg-black/80 font-mono text-xs">
        <div className="text-neutral-500">// Verify content in one call</div>
        <div className="mt-1">
          <span className="text-purple-400">const</span> <span className="text-blue-300">result</span> <span className="text-neutral-400">=</span> <span className="text-purple-400">await</span> <span className="text-yellow-300">katana</span>.<span className="text-blue-300">verify</span>({"{"}
        </div>
        <div className="pl-4 text-neutral-300">
          type: <span className="text-green-400">"image"</span>,
        </div>
        <div className="pl-4 text-neutral-300">
          url: <span className="text-green-400">"https://..."</span>
        </div>
        <div>{"}"});</div>
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
      "group relative col-span-3 flex flex-col justify-between border border-border/50 overflow-hidden rounded-xl",
      "bg-slate-950/60 [box-shadow:0_-90px_120px_-90px_#8A8AFF22_inset,0_90px_120px_-90px_#040010_inset]",
      className
    )}
  >
    <div>{background}</div>
    <div className="pointer-events-none z-10 flex flex-col gap-1 p-6 transition-all duration-300 group-hover:-translate-y-10">
      <Icon className="h-12 w-12 origin-left text-neutral-700 transition-all duration-300 ease-in-out group-hover:scale-75" />
      <h3 className="text-xl font-semibold text-neutral-300">{name}</h3>
      <p className="max-w-lg text-neutral-400">{description}</p>
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
    <div className="pointer-events-none absolute inset-0 transition-all duration-300 group-hover:bg-black/[.03] group-hover:dark:bg-neutral-800/10" />
  </div>
);

export { BentoCard, BentoGrid };
