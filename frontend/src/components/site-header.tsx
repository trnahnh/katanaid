import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "./ui/input";
import { LucideSearch } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="relative z-10 flex h-15 shrink-0 items-center gap-2 border-b transition-[width,height]">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Input id="search" type="text" placeholder="Search" className="w-80"/>
        <Button variant={"outline"}><LucideSearch /></Button>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              GitHub
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
