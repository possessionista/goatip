import { createClient } from "@supabase/supabase-js";
import { getTodayDateFormatted } from "@/lib/utils";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const selectedDate = searchParams.get("selectedDate");

  try {
    const { count: premiumCount, error: premiumError } = await supabase
      .from("daily_tips")
      .select("*", { count: "exact", head: true })
      .eq("date", selectedDate)
      .eq("is_premium", true);

    if (premiumError) {
      console.error("Error counting premium records:", premiumError);
      return new Response("Error fetching data", { status: 500 });
    }

    return new Response(JSON.stringify({ premiumCount }), {
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
