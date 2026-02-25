import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { liveStreams } from "@/database/mockData";

type ProxyBody = {
  action: string;
  payload?: Record<string, unknown>;
};

function getSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

function errorResponse(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  let body: ProxyBody;
  try {
    body = (await request.json()) as ProxyBody;
  } catch (error) {
    console.error("[supabase-proxy] Invalid JSON body", error);
    return errorResponse("Invalid request body", 400);
  }

  const { action, payload = {} } = body;

  if (!action) {
    return errorResponse("Missing action", 400);
  }

  let supabase;
  try {
    supabase = getSupabaseServerClient();
  } catch (error) {
    console.error("[supabase-proxy] Client init failed", error);
    return errorResponse(
      error instanceof Error ? error.message : "Failed to initialize Supabase client",
      500
    );
  }

  try {
    switch (action) {
      case "getUserData": {
        const userId = String(payload.userId ?? "");
        const field = String(payload.field ?? "user_id");
        const query = supabase.from("users").select("*");
        const byField =
          field === "user_id" || field === "mail"
            ? query.eq(field, userId)
            : query.ilike(field, `%${userId}%`);
        const { data, error } = await byField.maybeSingle();
        if (error) return errorResponse(error.message, 400);
        return NextResponse.json({ data });
      }

      case "setUserData": {
        const { userName, imageUrl, mail, dateOfBirth, userId } = payload;
        const { data, error } = await supabase
          .from("users")
          .upsert(
            {
              user_id: String(userId),
              image_url: String(imageUrl),
              mail: String(mail),
              date_of_birth: String(dateOfBirth),
              user_name: String(userName),
              following: [],
              followers: [],
              interests: [],
            },
            { onConflict: "user_id" }
          )
          .select()
          .single();
        if (error) return errorResponse(error.message, 400);
        return NextResponse.json({ data });
      }

      case "setUserInterests": {
        const userId = String(payload.userId ?? "");
        const interests = Array.isArray(payload.interests)
          ? (payload.interests as string[])
          : [];
        const { data, error } = await supabase
          .from("users")
          .update({ interests })
          .eq("user_id", userId)
          .select()
          .single();
        if (error) return errorResponse(error.message, 400);
        return NextResponse.json({ data });
      }

      case "getLivestreams": {
        const { data, error } = await supabase.from("livestreams").select("*");
        if (error) return errorResponse(error.message, 400);
        return NextResponse.json({ data });
      }

      case "createLivestream": {
        const { name, categories, userName, profileImageUrl, creatorName } = payload;
        const { data, error } = await supabase
          .from("livestreams")
          .upsert(
            {
              name: String(name),
              categories: Array.isArray(categories) ? categories : [],
              user_id: String(userName),
              profile_image_url: String(profileImageUrl),
              creator_name: String(creatorName),
            },
            { onConflict: "user_id" }
          )
          .select()
          .single();
        if (error) return errorResponse(error.message, 400);
        return NextResponse.json({ data });
      }

      case "deleteLivestream": {
        const userName = String(payload.userName ?? "");
        const { error } = await supabase
          .from("livestreams")
          .delete()
          .eq("user_id", userName);
        if (error) return errorResponse(error.message, 400);
        return NextResponse.json({ data: { success: true } });
      }

      case "setLivestreamsMockData": {
        const { error } = await supabase.from("livestreams").insert(liveStreams);
        if (error) return errorResponse(error.message, 400);
        return NextResponse.json({ data: { success: true } });
      }

      case "removeLivestreamsMockData": {
        const { error } = await supabase
          .from("livestreams")
          .delete()
          .in(
            "id",
            liveStreams.map((livestream) => livestream.id)
          );
        if (error) return errorResponse(error.message, 400);
        return NextResponse.json({ data: { success: true } });
      }

      case "followUser": {
        const currentUserId = String(payload.currentUserId ?? "");
        const userToFollowId = String(payload.userToFollowId ?? "");

        const { data: currentUser, error: currentUserError } = await supabase
          .from("users")
          .select("*")
          .eq("user_id", currentUserId)
          .single();
        if (currentUserError || !currentUser) {
          return errorResponse(
            currentUserError?.message || "Current user not found",
            400
          );
        }

        const { data: userToFollow, error: userToFollowError } = await supabase
          .from("users")
          .select("*")
          .eq("user_id", userToFollowId)
          .single();
        if (userToFollowError || !userToFollow) {
          return errorResponse(
            userToFollowError?.message || "User to follow not found",
            400
          );
        }

        let updatedCurrentUserFollowing: string[] = [];
        let updatedUserToFollowFollowers: string[] = [];

        if (currentUser.following.includes(userToFollowId)) {
          updatedCurrentUserFollowing = currentUser.following.filter(
            (id: string) => id !== userToFollow.user_id
          );
          updatedUserToFollowFollowers = userToFollow.followers.filter(
            (id: string) => id !== currentUserId
          );
        } else {
          updatedCurrentUserFollowing = [
            ...currentUser.following,
            userToFollowId,
          ];
          updatedUserToFollowFollowers = [
            ...userToFollow.followers,
            currentUserId,
          ];
        }

        const { error: updateCurrentError } = await supabase
          .from("users")
          .update({ following: updatedCurrentUserFollowing })
          .eq("user_id", currentUserId);
        if (updateCurrentError) return errorResponse(updateCurrentError.message, 400);

        const { error: updateFollowError } = await supabase
          .from("users")
          .update({ followers: updatedUserToFollowFollowers })
          .eq("user_id", userToFollow.user_id);
        if (updateFollowError) return errorResponse(updateFollowError.message, 400);

        return NextResponse.json({ data: { success: true } });
      }

      default:
        return errorResponse(`Unsupported action: ${action}`, 400);
    }
  } catch (error: unknown) {
    console.error(`[supabase-proxy] Action failed: ${action}`, error);
    return errorResponse(
      error instanceof Error ? error.message : "Unexpected proxy error",
      500
    );
  }
}
