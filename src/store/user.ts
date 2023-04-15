import {create} from "zustand";
import { persist } from "zustand/middleware";
import { throttle } from "throttle-debounce";
import { User } from "@supabase/supabase-js";
import { supabase } from "../utils/supabaseClient";
import { Database } from "../../types/supabase";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ExtUser extends User {
  profile: Profile;
}

interface UserState {
  isLoading: boolean;
  user: ExtUser | null;
  getSession: () => void;
  logout: () => void;
}

const userStore = create<UserState>()(
  persist<UserState>(
    (set) => ({
      isLoading: true,
      user: null,
      getSession: throttle(2000, async () => {
        async function fetchUser() {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          return user;
        }
        const sessionUser = await fetchUser();

        if (sessionUser) {
          const { data: profile } = await supabase
            .from("profiles")
            .select()
            .eq("id", sessionUser?.id)
            .single();
          if (profile) {
            const data = { ...sessionUser, profile };

            set({
              isLoading: false,
              user: data,
            });
          }
        }
        return { error: "No user found" };
      }),

      logout: async () => {
        supabase.auth.signOut();

        set({ user: null });
      },
    }),
    {
      // Add the configuration for persist middleware here.
      name: 'user-storage', // Change this to the appropriate storage name.
      // Add other configurations as needed.
    }
  )
);


export default userStore;
