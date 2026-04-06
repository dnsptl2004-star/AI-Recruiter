"use client";

import React from "react";
import DashboardProvider from "./provider"; 
import UserProvider from "@/app/provider";   

function DashboardLayout({ children }) {
  return (
    <div className="bg-secondary">
      <UserProvider>
        <DashboardProvider>
          <div className="p-10">{children}</div>
        </DashboardProvider>
      </UserProvider>
    </div>
  );
}

export default DashboardLayout;
