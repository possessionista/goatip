import { createClient } from "@supabase/supabase-js";
import { getTodayDateFormatted } from "@/lib/utils";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request) {
  const todayDate = getTodayDateFormatted();

  try {
    const { isSubscribed, selectedDate } = await request.json(); // Parse body

    let query = supabase
      .from("daily_tips")
      .select("*")
      .eq("date", selectedDate);
    //.in("date", ["04-06-2025"]);

    //.eq("date", "02-06-2025")
    // .eq("date", "04-06-2025");

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
