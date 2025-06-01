import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const getTodayDateFormatted = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();

  return `${day}-${month}-${year}`; // Return date in "DD-MM-YYYY" format
};

export async function POST(request) {
  const todayDate = getTodayDateFormatted();

  try {
    const { isSubscribed } = await request.json(); // Parse body

    let query = supabase.from("daily_tips").select("*").eq("date", todayDate);

    if (!isSubscribed) {
      query = query.eq("is_premium", false);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error querying Supabase:", error);
      return new Response("Error querying data", { status: 500 });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response("Unexpected error", { status: 500 });
  }
}
