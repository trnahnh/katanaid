import * as React from "react";
import {
  IconBook,
  IconChartBar,
  IconFingerprint,
  IconSettings,
  IconMailCode,
  IconShieldCheck,
  IconShield,
  IconShieldLock,
} from "@tabler/icons-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { NavSecondary } from "@/components/nav-secondary";
import { useAuthStore } from "@/store/useAuthStore";
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


const data = {
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
    {
      title: "Email Service",
      url: "/dashboard/email-service",
      icon: IconMailCode,
    },
    {
      title: "Email Fraud",
      url: "/dashboard/email-fraud",
      icon: IconShieldCheck,
    },
    {
      title: "CAPTCHA",
      url: "/dashboard/captcha",
      icon: IconShield,
    },
    {
      title: "Trial Prevention",
      url: "/dashboard/trust",
      icon: IconShieldLock,
    }
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Documentations",
      url: "https://docs.katanaid.com/",
      icon: IconBook,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { authUser } = useAuthStore();

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
                      <span className="group-data-[collapsible=icon]:hidden">{service.title}</span>
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
        <NavUser user={{
          name: authUser?.username ?? "User",
          email: authUser?.email ?? "",
          avatar: "",
        }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
