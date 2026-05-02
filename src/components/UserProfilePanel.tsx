"use client";

import {
  IconLogout,
  IconUserCircle,
  IconMoon,
  IconSun,
  IconDotsVertical,
} from "@tabler/icons-react";

import { useTheme } from "@/context/ThemeContext";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";

type Props = {
  name: string;
  email: string;
  avatar?: string;
};

export default function UserProfileMenu({ name, email, avatar }: Props) {
  const { theme, toggleTheme } = useTheme();

  function handelLogout() {
    signOut({ redirect: true, callbackUrl: "/login" });
  }

  return (
    <div className="flex items-center justify-between p-3 hover:bg-bg-soft rounded-xl transition">
      {/* LEFT SIDE (USER INFO) */}
      <div className="flex items-center gap-3">
        <Avatar className="w-9 h-9">
          <AvatarImage src={avatar} />
          <AvatarFallback className="bg-primary text-white">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col text-left">
          <span className="text-sm font-semibold">{name}</span>
          <span className="text-[11px] text-text-muted">{email}</span>
        </div>
      </div>

      {/* RIGHT SIDE (MENU BUTTON) */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-2 cursor-pointer rounded-lg hover:bg-bg-soft transition">
            <IconDotsVertical className="w-5 h-5 text-text-muted" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem className="flex items-center cursor-pointer">
            <IconUserCircle className="mr-2 cursor-pointer h-4 w-4" />
            Profile
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={toggleTheme}
            className="flex items-center cursor-pointer"
          >
            {theme === "dark" ? (
              <IconSun className="mr-2 h-4 w-4 text-yellow-400" />
            ) : (
              <IconMoon className="mr-2 h-4 w-4" />
            )}
            Toggle Theme
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem className="flex items-center  text-red-500">
            <button onClick={handelLogout} className="flex cursor-pointer items-center w-full">
              <IconLogout className="mr-2 h-4 w-4" />
              Log out
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
