import { Button } from "./ui/button";
import { ArrowRight, ChevronDown, Github, Menu } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@radix-ui/react-hover-card";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import Logo from "./Logo";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "./ui/sheet";

const NavBar = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuthStore();

  return (
    <nav className="sticky top-0 z-50 w-full h-full border-b border-border/40 bg-background/10 backdrop-blur-md py-1.5 px-4">
      <div className="mx-auto max-w-6xl flex items-center">
        {/* Logo */}
        <div
          className="flex-1 flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <Logo />
          <p className="text-xl hover:drop-shadow-[0_0_10px_rgba(60,130,240,1)] transition-all">
            KatanaID
          </p>
        </div>

        {/* Desktop nav - hidden on mobile */}
        <div className="flex-1 hidden md:flex items-center justify-center gap-3">
          <HoverCard openDelay={100} closeDelay={200}>
            <HoverCardTrigger asChild>
              <Button variant="ghost" className="group gap-1">
                Developers
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent
              className="w-44 p-1.5 bg-popover/95 backdrop-blur-md rounded-lg border border-border/50 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
              sideOffset={8}
            >
              <div className="flex flex-col">
                <a
                  href="https://github.com/suka712"
                  className="px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                >
                  Khiem Nguyen
                </a>
                <a
                  href="https://github.com/trnahnh"
                  className="px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                >
                  Anh Tran
                </a>
                <div className="my-1.5 border-t border-border/50" />
                <a
                  href="https://github.com/trnahnh/katanaid"
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              </div>
            </HoverCardContent>
          </HoverCard>
          <Button variant="ghost">Demo</Button>
          <Button variant="ghost">Contact</Button>
        </div>

        {/* Desktop right section - hidden on mobile */}
        <div className="flex-1 hidden md:flex items-center justify-end gap-3">
          {token === null ? (
            <Button variant="ghost" onClick={() => navigate("/signup")}>
              Sign in
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Log out
            </Button>
          )}
          <Button variant="default">
            Verify content <ArrowRight />
          </Button>
        </div>

        {/* Mobile menu button + sheet */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="">
              <div className="flex flex-col gap-4 mt-4 px-5 pt-10">
                <Button variant="ghost" className="justify-start">
                  Demo
                </Button>
                <Button variant="ghost" className="justify-start">
                  Contact
                </Button>
                <div className="flex flex-col gap-1 pt-4 border-t border-border/50">
                  <a
                    href="https://github.com/suka712"
                    className="px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                  >
                    Khiem Nguyen
                  </a>
                  <a
                    href="https://github.com/trnahnh"
                    className="px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                  >
                    Anh Tran
                  </a>
                  <a
                    href="https://github.com/trnahnh/katanaid"
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                </div>
                <div className="border-t pt-4 flex flex-col gap-2">
                  {token === null ? (
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => navigate("/signup")}
                    >
                      Sign in
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => {
                        logout();
                        navigate("/");
                      }}
                    >
                      Log out
                    </Button>
                  )}
                  <Button variant="default" className="w-full justify-start">
                    Verify content <ArrowRight />
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
