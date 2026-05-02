"use client";

import UsersList from "@/components/UsersList";
import { useEffect, useState } from "react";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative h-screen w-full bg-bg text-text flex">
      {/* APP CONTENT */}
      <div
        className={`flex w-full h-full transition-opacity duration-300 ${loading ? "opacity-30" : "opacity-100"}`}
      >
        {/* Sidebar */}
        <div className="w-[320px] border-r border-border bg-card overflow-y-auto">
          <UsersList />
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">{children}</div>
      </div>

      {/* GLOBAL LOADING OVERLAY */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px] z-50">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin shadow-lg" />
        </div>
      )}
    </div>
  );
}
