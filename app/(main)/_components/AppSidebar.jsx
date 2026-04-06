"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { SideBarOptions } from "@/lib/services/Constants";
import { usePathname } from "next/navigation";

export function AppSidebar() {

  const path=usePathname();
  console.log(path);
  return (
    <Sidebar>
      <SidebarHeader className="flex flex-col items-center mt-5">
        <Image src="/login.png" alt="logo" width={200} height={100} />
       <Link href="/dashboard/create-interview" className="w-full">
  <Button className="w-full mt-5 flex items-center justify-center gap-2">
    <Plus /> Create New Interview
  </Button>
</Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {SideBarOptions.map((Option, index) => (
              <SidebarMenuItem key={index} className='p-1'>
                <SidebarMenuButton asChild className={`p-5 ${path==Option.path&&'bg-blue-50'}`}>
                  <Link href={Option.path} >
                   <Option.icon className={` ${path==Option.path && 'text-primary'}`} />
                    <span className={`text-[16px] font-medium ${path==Option.path && 'text-primary'}`}>{Option.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
}
