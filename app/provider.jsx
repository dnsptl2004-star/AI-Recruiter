"use client";

import React, { useEffect, useState, useContext, useCallback } from "react";
import { supabase } from "@/lib/services/supabaseClient";
import { UserDetailContext } from "./context/UserDetailContext";

function mapAuthUser(authUser) {
  const meta = authUser?.user_metadata ?? {};
  const fallbackName =
    (authUser?.email && authUser.email.split("@")[0]) || "User";

  return {
    id: authUser?.id ?? null,
    name:
      meta.full_name ||
      meta.name ||
      meta.given_name ||
      meta.nickname ||
      fallbackName,
    email: authUser?.email ?? "",
    picture:
      meta.avatar_url ||
      meta.picture ||
      "/default-avatar.png",
  };
}

function Provider({ children }) {
  const [user, setUser] = useState(null);

  const loadCurrentUser = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        setUser(null);
        return null;
      }

      const authUser = data.user;
      const fallbackUser = mapAuthUser(authUser);

      setUser(fallbackUser);

      try {
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("id, name, email, picture")
          .eq("id", authUser.id)
          .maybeSingle();

        if (!profileError && profile) {
          setUser(profile);
          return profile;
        }
      } catch (profileErr) {
        console.warn("Profile fetch skipped:", profileErr);
      }

      return fallbackUser;
    } catch (err) {
      console.warn("loadCurrentUser failed:", err);
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!mounted) return;
      await loadCurrentUser();
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (!mounted) return;

        if (session?.user) {
          const authUser = session.user;
          const fallbackUser = mapAuthUser(authUser);

          setUser(fallbackUser);

          try {
            const { data: profile, error: profileError } = await supabase
              .from("users")
              .select("id, name, email, picture")
              .eq("id", authUser.id)
              .maybeSingle();

            if (!profileError && profile) {
              setUser(profile);
            }
          } catch (profileErr) {
            console.warn("Profile fetch skipped:", profileErr);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth state change handler error:", err);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe?.();
    };
  }, [loadCurrentUser]);

  return (
    <UserDetailContext.Provider value={{ user, setUser }}>
      {children}
    </UserDetailContext.Provider>
  );
}

export default Provider;
export const useUser = () => useContext(UserDetailContext);