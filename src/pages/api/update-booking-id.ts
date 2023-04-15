import { NextApiRequest, NextApiResponse } from "next";
import { logApiRequest } from "../../utils/helpers";
import { getServiceSupabase } from "../../utils/supabaseClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id, query } = req.body;
  logApiRequest(req);
  console.log(id, query);
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("bookings")
    .update(query)
    .eq("id", id)
    .select();

  console.log(data, error);
  if (error) {
    console.log(error);
    console.log("error updating booking");
    res.status(500).json({ error: error.message });
  }
  console.log("booking updated");
  res.status(200).json(data);
}

