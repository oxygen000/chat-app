"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaUserCircle, FaSearch } from "react-icons/fa";
import UserProfileMenu from "./UserProfilePanel";

import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSession } from "next-auth/react";

/* ================= TYPES ================= */

type User = {
  id: string;
  name: string;
  email: string;
};

type Chat = {
  lastMessage?: string;
  lastMessageAt?: {
    seconds: number;
  };
  unreadCount?: number;
};

/* ================= HELPERS ================= */

function getChatId(a: string, b: string) {
  return [a, b].sort().join("_");
}

/* ================= COMPONENT ================= */

export default function UsersList() {
  const router = useRouter();
  const { data: session } = useSession();

  const currentUser = session?.user?.id;

  const [users, setUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<Record<string, Chat>>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = query(collection(db, "users"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: User[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<User, "id">),
      }));

      setUsers(data);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "chats"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Record<string, Chat> = {};

      snapshot.docs.forEach((doc) => {
        data[doc.id] = doc.data() as Chat;
      });

      setChats(data);
    });

    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter((u) => {
    const value = search.trim().toLowerCase();

    return (
      u.id !== currentUser &&
      (u.name.toLowerCase().includes(value) ||
        u.email.toLowerCase().includes(value))
    );
  });

  /* ================= UI ================= */

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">

      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2 bg-bg px-3 py-2 rounded-xl">
          <FaSearch className="text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="bg-transparent outline-none flex-1 text-sm text-text"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">

        {filteredUsers.length === 0 && (
          <p className="text-center text-xs text-text-muted mt-4">
            No users found
          </p>
        )}

        {filteredUsers.map((user) => {
          if (!currentUser) return null;

          const chatId = getChatId(currentUser, user.id);
          const chat = chats[chatId];

          return (
            <div
              key={user.id}
              onClick={() => router.push(`/chat/${chatId}`)}
              className="flex items-center gap-3 p-3 hover:bg-bg-soft cursor-pointer transition"
            >
              <FaUserCircle className="text-3xl text-text-muted" />

              <div className="flex flex-col flex-1">

                {/* NAME + TIME */}
                <div className="flex justify-between items-center">
                  <span className="font-medium">{user.name}</span>

                  <span className="text-[10px] text-text-muted">
                    {chat?.lastMessageAt
                      ? new Date(chat.lastMessageAt.seconds * 1000).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>
                </div>

                {/* MESSAGE + UNREAD */}
                <div className="flex justify-between items-center">
                  <p className="text-xs text-text-muted truncate">
                    {chat?.lastMessage || "Start chatting..."}
                  </p>

                  {chat?.unreadCount && chat.unreadCount > 0 && (
                    <span className="text-[10px] bg-green-500 text-white px-2 py-[2px] rounded-full">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

      <UserProfileMenu
        name={(session?.user as { name?: string })?.name || ""}
        email={session?.user?.email || ""}
        avatar=""
      />
    </div>
  );
}