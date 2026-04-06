"use client";

import { supabase } from "@/lib/services/supabaseClient";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Login() {

  const signInWithGoogle = async () => {
    try {
      const redirectTo = `${window.location.origin}/dashboard`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            prompt: "select_account"  
          }
        }
      });

      if (error) {
        console.error("OAuth error:", error);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }

    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6">
      <div className="flex flex-col items-center border rounded-2xl p-8">
        <Image src="/login.png" alt="logo" width={400} height={100} />
        <div className="flex items-center flex-col border rounded-2xl p-6">
          <Image src="/page.png" alt="login" width={600} height={400} />
          <h2 className="text-2xl font-bold text-center mt-5">Welcome to Airecruiter</h2>
          <p className="text-gray-500 text-center">Sign in with Google Authentication</p>

          <Button className="mt-7 w-full" onClick={signInWithGoogle}>
            Login with Google
          </Button>
        </div>
      </div>
    </div>
  );
}