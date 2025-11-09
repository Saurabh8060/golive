import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useState } from "react";
import type { Tables } from "@/database/database.types";
import { liveStreams } from "@/database/mockData";
import { useSession } from "@clerk/nextjs";

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

    setSupabase(supabaseClient);
  }, []);

const { session } = useSession();
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
    
    try {
      // Refresh token before making the request
      if (session) {
        const freshToken = await session.getToken();
        if (freshToken && supabase) {
          // Update auth token in supabase client
          supabase.realtime.setAuth(freshToken);
        }
      }
      
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .ilike(field, `%${userId}`)
        .single();

      console.log("User data: ", data);
      
      if (error) {
        // If JWT expired error, try one more time with fresh client
        if (error.code === 'PGRST301' || error.message.includes('JWT')) {
          console.log('JWT expired, reinitializing client...');
          const newToken = await session?.getToken();
          if (newToken) {
            setSupabaseClient(newToken);
            // Retry the request will happen on next call
          }
        }
        
        console.log("Error getting user data:", error);
        setError(`Error getting user data: ${error.message}`);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Error getting user data", error);
      return null;
    }
  },
  [supabase, session, setSupabaseClient]
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
      const { data, error } = await supabase
        .from("users")
        .insert({
          user_id: userId,
          image_url: imageUrl,
          mail: mail,
          date_of_birth: dateOfBirth,
          user_name: userName,
          following: [],
          followers: [],
          interests: [],
        })
        .select()
        .single();
      if (error) {
        console.error("Error setting user data", error);
        setError(`Error setting user data: ${error.message}`);
        return null;
      }
      return data as Tables<"users">;
    },
    [supabase]
  );

  const setUserInterests = useCallback(
    async (
      interests: string[],
      userId: string
    ): Promise<Tables<"users"> | null> => {
      if (!supabase) return null;
      const { data, error } = await supabase
        .from("users")
        .update({ interests: interests })
        .eq("user_id", userId)
        .select()
        .single();
      if (error) {
        console.log("Error setting user interests", error);
        setError(`Error setting user interests: ${error.message}`);
        return null;
      }
      return data as Tables<"users">;
    },
    [supabase]
  );

  const getLivestreams = useCallback(async (): Promise<
    Tables<"livestreams">[]
  > => {
    if (!supabase) {
      return [];
    }
    const { data, error } = await supabase.from("livestreams").select("*");
    if (error) {
      console.log("Error getting livestreams", error);
      return [];
    }
    return data as Tables<"livestreams">[];
  }, [supabase]);

  const createLivestream = useCallback(
    async (
      name: string,
      categories: string[],
      userName: string,
      profileImageUrl: string,
      creatorName: string
    ): Promise<Tables<"livestreams"> | null> => {
      if (!supabase) {
        console.log("[createLivestream] supabase not initialized");
        return null;
      }
      const { data, error } = await supabase
        .from("livestreams")
        .upsert({
          name: name,
          categories: categories,
          user_id: userName,
          profile_image_url: profileImageUrl,
          creator_name: creatorName
        },
       { 
      onConflict: 'user_id' 
      })
        .select()
        .single();
      if (error) {
        console.log("Error creating livestream", error);
        setError(error.message);
        return null;
      }
      return data as Tables<"livestreams">;
    },
    [supabase]
  );

  const deleteLivestream = useCallback(
    async (userName: string): Promise<boolean> => {
      if (!supabase) {
        console.log("[deleteLivestream] supabase not initialized");
        return false;
      }
      const { error } = await supabase
        .from("livestreams")
        .delete()
        .eq("user_id", userName);
      if (error) {
        console.log("Error creating livestream", error);
        setError(error.message);
        return false;
      }
      return true;
    },
    [supabase]
  );

  const setLivestreamsMockData = useCallback(async () => {
    if (!supabase) {
      console.log("[deleteLivestream] supabase not initialized");
      return;
    }
    const { data, error } = await supabase
      .from("livestreams")
      .insert(liveStreams);
    if (error) {
      console.log("Error creating livestream", error);
      setError(error.message);
      return;
    }
    return data;
  }, [supabase]);

  const removeLivestreamsMockData = useCallback(async () => {
    if (!supabase) {
      console.log("[deleteLivestream] supabase not initialized");
      return;
    }
    const { data, error } = await supabase
      .from("livestreams")
      .delete()
      .in(
        "id",
        liveStreams.map((livestream) => livestream.id)
      );
    if (error) {
      console.log("Error creating livestream", error);
      setError(error.message);
    }
  }, [supabase]);

  const followUser = useCallback(
    async (currentUserId: string, userToFollowId: string): Promise<boolean> => {
      if(!supabase){
        console.log('[followUser] Supabase not initialized');
        return false;
      };

      try{
        const currentUser = await getUserData(currentUserId, 'user_id');
        if(!currentUser) {
          console.log('[followUser] Current user not found');
          return false;
        }
        const userToFollow = await getUserData(userToFollowId, 'user_id');
        if(!userToFollow){
          console.log('[followUser] user to follow not found');
          return false;
        }

        let updatedCurrentUserFollowing : string[] = [];
        let updatedUserToFollowFollowers: string[] = [];

        if(currentUser.following.includes(userToFollowId)){
          updatedCurrentUserFollowing = currentUser.following.filter((id) => id !== userToFollow.user_id);
          updatedUserToFollowFollowers = userToFollow.followers.filter((id) => id !== currentUserId);
        }else{
          updatedCurrentUserFollowing = [
            ...currentUser.following,
            userToFollowId,
          ];
          updatedUserToFollowFollowers = [
            ...userToFollow.followers,
            currentUserId
          ];
        }

        const {error: currentUserError} = await supabase.from('users').update({following: updatedCurrentUserFollowing}).eq('user_id', currentUserId);

        if(currentUserError){
          console.log('[followuser] error updating current user following', currentUserError);
          return false;
        }

        const {error: userToFollowError} = await supabase.from('users').update({followers: updatedUserToFollowFollowers}).eq('user_id', userToFollow.user_id);

        if(userToFollowError){
          console.log('[followUser] Error updating user to follow followers', userToFollowError);
          return false;
        }
        console.log('[followerUser] successfully followed user');
        return true;
      }catch(error){
        console.log('[followUser] error following user', error);
        return false;
      }
    }, [supabase, getUserData]);

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
