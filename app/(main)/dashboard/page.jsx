"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import CreateOptions from "./_components/CreateOptions";
import LatestInterviewsList from "./_components/LatestInterviewsList";
import { supabase } from "@/lib/services/supabaseClient";

export default function Dashboard() {
  

  return (
    <div>
      <h2 className="my-3 font-bold text-2xl"> Dashboard</h2>
      <CreateOptions />
      <LatestInterviewsList />
    </div>
  );
}
