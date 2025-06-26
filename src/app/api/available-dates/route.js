import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("daily_tips")
      .select("date")
      .neq("match_name", null)
      .neq("match_name", "")
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching dates:", error);
      return new Response("Error fetching data", { status: 500 });
    }

    const uniqueDates = Array.from(new Set(data.map((item) => item.date)));

    return new Response(JSON.stringify({ dates: uniqueDates }), {
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
