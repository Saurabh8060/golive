import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useState } from "react";
import type { Tables } from "@/database/database.types";

type DatabaseContextType = {
  supabase: SupabaseClient | null;
  error: string | null;
  setSupabaseClient: (accessToken: string) => void;
  getUserData: (
    userId: string,
    field?: string
  ) => Promise<Tables<"users"> | null>;
  setUserData: (
    userName: string,
    imageUrl: string,
    mail: string,
    dateOfBirth: string,
    userId: string
  ) => Promise<Tables<"users"> | null>;
  setUserInterests: (
    interests: string[],
    userId: string
  ) => Promise<Tables<"users"> | null>;

  getLivestreams: () => Promise<Tables<"livestreams">[]>;
  createLivestream: (
    name: string,
    categories: string[],
    userName: string,
    profileImageUrl: string,
    creatorName: string
  ) => Promise<Tables<"livestreams"> | null>;

  deleteLivestream: (userName: string) => Promise<boolean>;

  setLivestreamsMockData: () => void;
  removeLivestreamsMockData: () => void;

  followUser: (
    currentUserId: string,
    userToFollowid: string
  ) => Promise<boolean>;
};

export const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const DatabaseProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setSupabaseClient = useCallback((accessToken: string): void => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables");
    }
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      accessToken: async () => accessToken,
    });

    setError(null);
    setSupabase(supabaseClient);
  }, []);

  const callDbApi = useCallback(
    async <T,>(action: string, payload?: Record<string, unknown>): Promise<T | null> => {
      try {
        const response = await fetch("/api/supabase-proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, payload }),
        });

        const result = (await response.json()) as {
          data?: T;
          error?: string;
        };

        if (!response.ok || result.error) {
          const message = result.error || `Request failed (${response.status})`;
          console.error(`[supabase-proxy:${action}]`, message);
          setError(message);
          return null;
        }

        setError(null);
        return result.data ?? null;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[supabase-proxy:${action}]`, error);
        setError(message);
        return null;
      }
    },
    []
  );

  const getUserData = useCallback(
  async (
    userId: string,
    field: string = "user_id"
  ): Promise<Tables<"users"> | null> => {
    console.log(
      "Getting user data from supabase: ",
      !!supabase,
      "for userId: ",
      userId
    );
    
    if (!supabase) {
      return null;
    }
    const data = await callDbApi<Tables<"users">>("getUserData", { userId, field });
    console.log("User data: ", data);
    return data;
  },
  [callDbApi, supabase]
);

  const setUserData = useCallback(
    async (
      userName: string,
      imageUrl: string,
      mail: string,
      dateOfBirth: string,
      userId: string
    ): Promise<Tables<"users"> | null> => {
      if (!supabase) {
        return null;
      }
      return callDbApi<Tables<"users">>("setUserData", {
        userName,
        imageUrl,
        mail,
        dateOfBirth,
        userId,
      });
    },
    [callDbApi, supabase]
  );

  const setUserInterests = useCallback(
    async (
      interests: string[],
      userId: string
    ): Promise<Tables<"users"> | null> => {
      if (!supabase) return null;
      return callDbApi<Tables<"users">>("setUserInterests", { interests, userId });
    },
    [callDbApi, supabase]
  );

  const getLivestreams = useCallback(async (): Promise<
    Tables<"livestreams">[]
  > => {
    if (!supabase) {
      return [];
    }
    const data = await callDbApi<Tables<"livestreams">[]>("getLivestreams");
    return data ?? [];
  }, [callDbApi, supabase]);

  const createLivestream = useCallback(
    async (
      name: string,
      categories: string[],
      userName: string,
      profileImageUrl: string,
      creatorName: string
    ): Promise<Tables<"livestreams"> | null> => {
      if (!supabase) {
        console.error("[createLivestream] supabase not initialized");
        return null;
      }
      return callDbApi<Tables<"livestreams">>("createLivestream", {
        name,
        categories,
        userName,
        profileImageUrl,
        creatorName,
      });
    },
    [callDbApi, supabase]
  );

  const deleteLivestream = useCallback(
    async (userName: string): Promise<boolean> => {
      if (!supabase) {
        console.error("[deleteLivestream] supabase not initialized");
        return false;
      }
      const result = await callDbApi<{ success: boolean }>("deleteLivestream", {
        userName,
      });
      return Boolean(result?.success);
    },
    [callDbApi, supabase]
  );

  const setLivestreamsMockData = useCallback(async () => {
    if (!supabase) {
      console.error("[setLivestreamsMockData] supabase not initialized");
      return;
    }
    await callDbApi<{ success: boolean }>("setLivestreamsMockData");
  }, [callDbApi, supabase]);

  const removeLivestreamsMockData = useCallback(async () => {
    if (!supabase) {
      console.error("[removeLivestreamsMockData] supabase not initialized");
      return;
    }
    await callDbApi<{ success: boolean }>("removeLivestreamsMockData");
  }, [callDbApi, supabase]);

  const followUser = useCallback(
    async (currentUserId: string, userToFollowId: string): Promise<boolean> => {
      if(!supabase){
        console.error('[followUser] Supabase not initialized');
        return false;
      };

      const result = await callDbApi<{ success: boolean }>("followUser", {
        currentUserId,
        userToFollowId,
      });
      return Boolean(result?.success);
    }, [callDbApi, supabase]);

  return (
    <DatabaseContext.Provider
      value={{
        supabase,
        error,
        setSupabaseClient,
        getUserData,
        setUserData,
        setUserInterests,
        getLivestreams,
        createLivestream,
        deleteLivestream,
        setLivestreamsMockData,
        removeLivestreamsMockData,
        followUser
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
};
