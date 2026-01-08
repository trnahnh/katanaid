import * as React from "react";
import {
  IconBook,
  IconChartBar,
  IconFingerprint,
  IconSettings,
} from "@tabler/icons-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import Logo from "./Logo";
import { Button } from "./ui/button";

const data = {
  user: {
    name: "User",
    email: "user@example.com",
    avatar: "",
  },
  services: [
    {
      title: "Generative Identity",
      url: "/dashboard/generative-identity",
      icon: IconFingerprint,
    },
    {
      title: "Traffic Analytics",
      url: "/dashboard/traffic-analytics",
      icon: IconChartBar,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Documentations",
      url: "http://docs.katanaid.com/",
      icon: IconBook,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 h-10" onClick={() => navigate("/dashboard")}>
              <Logo />
              {state === "expanded" && <span>KatanaID</span>}
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Services</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.services.map((service) => (
                <SidebarMenuItem key={service.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === service.url}
                    tooltip={service.title}
                  >
                    <Link to={service.url}>
                      <service.icon />
                      <span>{service.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
