import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const getTodayDateFormatted = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();

  return `${day}-${month}-${year}`; // "DD-MM-YYYY"
};

export async function GET() {
  const todayDate = getTodayDateFormatted();

  try {
    const { count: premiumCount, error: premiumError } = await supabase
      .from("daily_tips")
      .select("*", { count: "exact", head: true })
      .in("date", ["04-06-2025"])
      .eq("is_premium", true);
    //.eq("date", todayDate)

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
