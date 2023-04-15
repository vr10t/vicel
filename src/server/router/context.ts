// src/server/router/context.ts
import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import {createServerSupabaseClient} from "@supabase/auth-helpers-nextjs"
import {  getServiceSupabase } from "../../utils/supabaseClient";
import { Database } from "../../../types/supabase";
 
export const createContext = (opts: trpcNext.CreateNextContextOptions) => {
  const {req} = opts;
  const {res} = opts;

 
  return {
    
    req,
    res,
   
  };
};

type Context = trpc.inferAsyncReturnType<typeof createContext>;

export const createRouter = () => trpc.router<Context>();
