import { Button } from "./ui/button";
import { ArrowRight, LucideCodeXml, Menu } from "lucide-react";
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
    <nav className="sticky top-0 w-full h-full border-b-2 bg-background py-1.5 px-4">
      <div className="mx-auto max-w-6xl flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <Logo />
          <p className="text-xl hover:drop-shadow-[0_0_10px_rgba(60,130,240,1)] transition-all">
            KatanaID
          </p>
        </div>

        {/* Desktop nav - hidden on mobile */}
        <div className="hidden md:flex items-center justify-center gap-3">
          <HoverCard openDelay={200} closeDelay={400}>
            <HoverCardTrigger asChild>
              <Button variant="ghost">Developers</Button>
            </HoverCardTrigger>
            <HoverCardContent className="gap-2 mt-2 bg-popover p-2 rounded-md border animate-accordion-down">
              <div className="flex gap-2">
                <a href="https://github.com/suka712">
                  <Button variant="secondary">Khiem Nguyen</Button>
                </a>
                <a href="https://github.com/trnahnh">
                  <Button variant="secondary">Anh Tran</Button>
                </a>
              </div>
              <a href="https://github.com/trnahnh/katanaid">
                <Button variant="outline" className="mt-2 w-full">
                  <LucideCodeXml />
                  GitHub
                </Button>
              </a>
            </HoverCardContent>
          </HoverCard>
          <Button variant="ghost">Demo</Button>
          <Button variant="ghost">Contact</Button>
        </div>

        {/* Desktop right section - hidden on mobile */}
        <div className="hidden md:flex items-center justify-end gap-3">
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
                <div className="flex flex-col gap-2 pt-4 border-t">
                  <a href="https://github.com/suka712">
                    <Button variant="ghost" className="w-full justify-start">
                      Khiem Nguyen
                    </Button>
                  </a>
                  <a href="https://github.com/trnahnh">
                    <Button variant="ghost" className="w-full justify-start">
                      Anh Tran
                    </Button>
                  </a>
                  <a href="https://github.com/trnahnh/katanaid">
                    <Button variant="outline" className="w-full justify-start">
                      <LucideCodeXml className="mr-2" />
                      GitHub
                    </Button>
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
