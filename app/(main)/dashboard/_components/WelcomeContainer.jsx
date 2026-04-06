"use client";
import React from "react";
import { useUser } from "@/app/provider";
import Image from "next/image";
import Link from "next/link";

function WelcomeContainer() {
  const { user } = useUser(); 

  return (
    <div className="bg-white p-5 rounded-xl flex justify-between items-center">
    <div>
      <h2 className="text-lg font-bold">Welcome Back, {user?.name}</h2>
      <h2 className="text-gray-500">AI-Driven Interviews, Hassels-Free Hiring</h2>
    </div>
   <Link href="/settings" className="cursor-pointer">
  {user?.picture && (
    <Image
      src={user.picture}
      alt="userAvatar"
      width={40}
      height={40}
      className="rounded-full"
    />
  )}
</Link>
    </div>
  );
}

export default WelcomeContainer;
