"use client";

import ProtectedRoute from "/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { supabase } from "/lib/dbClient";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { ChartContainer } from "@/components/ui/chart";
import { Bar, BarChart, ReferenceLine, XAxis } from "recharts";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dailyTips, setDailyTips] = useState([]);
  const { theme, setTheme } = useTheme();
  const [selectedTip, setSelectedTip] = useState("");

  useEffect(() => {
    const getUserAndSubscription = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        setLoading(false);
        return;
      }

      setUser(data.user);

      // Check subscription status
      const res = await fetch("/api/check-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.user.email }),
      }).catch((err) => {
        console.error("Fetch failed:", err);
      });

      const result = await res.json();

      setIsSubscribed(result.isSubscribed);
      setLoading(false);
    };

    getUserAndSubscription();
  }, []);

  useEffect(() => {
    const fetchDailyTips = async () => {
      const response = await fetch("/api/daily-tips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isSubscribed: isSubscribed }), // <-- pass actual value here
      });

      if (response.ok) {
        const data = await response.json();
        setDailyTips(data);
        console.log("Daily Tips:", data);
      } else {
        console.error("Failed to fetch daily tips");
      }
    };
    fetchDailyTips();
  }, [isSubscribed]);

  useEffect(() => {
    setTheme("dark");
  }, [setTheme]);

  const handleDarkMode = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const formatChartData = (inputString) => {
    const dataArray = JSON.parse(inputString);

    const chartData = dataArray.map((item) => ({
      week: item[0].toString(),
      value: item[1],
    }));

    return chartData;
  };

  const chartConfig = {
    value: {
      label: "Value",
      color: "#A0C3D2",
    },
  };

  const roundToNextOdd = (number) => {
    return (Math.ceil(number * 2) / 2).toFixed(1);
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <ProtectedRoute>
      <div className="p-4">
        <div className="flex justify-between">
          <h1 className="text-2xl mb-4">Dashboard</h1>

          <div className="flex full justify-between content-center gap-4">
            <Button variant="outline" onClick={handleDarkMode}>
              <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            </Button>

            <Button
              /* className="mt-4 bg-red-500 text-white px-4 py-2" */
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/login";
              }}
            >
              Logout
            </Button>
          </div>
        </div>

        {`${dailyTips.length} Tips Today`}

        {dailyTips.map((el, index) => {
          return (
            <Accordion
              type="single"
              collapsible
              className="w-full"
              defaultValue="item-1"
              onValueChange={(tip) => {
                setSelectedTip(tip);
              }}
              key={`acc-${index}`}
            >
              <AccordionItem
                value={`item-${index + 1}`}
                className={`transition-all duration-200 ${
                  selectedTip === `item-${index + 1}`
                    ? "border border-1 border-gray-950 dark:border-gray-100 my-2 p-4"
                    : "border border-transparent"
                }`}
              >
                <AccordionTrigger>
                  <div className="flex w-full justify justify-between">
                    <span>
                      {`${el.team} ${el.call} ${roundToNextOdd(el.average)} ${
                        el.stat
                      }`}
                    </span>
                    <span>{`Min. Odd: ${el.suggested_minimal_odd}`}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 text-balance">
                  <div className="flex flex-col lg:flex-row w-full items-stretch gap-4">
                    <div className="w-full lg:w-[40%]">
                      <div className="flex flex-col space-y-6">
                        {/* Stat Block 1 */}
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {`${el.team} overall assertivity when ${el.mando}`}
                          </span>
                          <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {`${(
                              el.team_overall_assertivity_this_mando * 100
                            ).toFixed(2)}% (${
                              el.total_calls_overall_this_mando
                            } calls)`}
                          </span>
                        </div>

                        {/* Stat Block 2 */}
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {`${el.team} assertivity when calling ${el.call} at ${el.mando}`}
                          </span>
                          <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {`${(
                              el.team_calls_assertivity_this_mando * 100
                            ).toFixed(2)}% (${
                              el.total_calls_this_mando
                            } calls)`}
                          </span>
                        </div>

                        {/* Stat Block 3 */}
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {`${el.team} assertivity when calling ${el.call} ${el.stat} at ${el.mando}`}
                          </span>
                          <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {`${(
                              el.team_calls_this_stat_assertivity_this_mando *
                              100
                            ).toFixed(2)}% (${
                              el.total_calls_this_stat_this_mando
                            } calls)`}
                          </span>
                        </div>

                        {/* Same mando teams assertivity */}
                        <div className="flex flex-col">
                          <span className="flex text-sm font-medium text-gray-600 dark:text-gray-400">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize mr-1">
                              {el.mando}
                            </span>
                            {`teams average assertivity`}
                          </span>
                          <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {`${(
                              el.teams_assertivity_overall_percentage_this_mando *
                              100
                            ).toFixed(2)}%`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="h-[2px] bg-gray-300 lg:h-auto lg:w-[2px] lg:self-stretch"></div>

                    <div className="w-full lg:w-[60%] flex flex-col justify-end">
                      <ChartContainer
                        config={chartConfig}
                        className="min-h-[200px] w-full max-h-[90%]"
                      >
                        <BarChart
                          accessibilityLayer
                          data={formatChartData(el.last_5_occurrences)}
                        >
                          <ReferenceLine
                            y={el.average}
                            stroke="#F3D17C"
                            label={{
                              position: "top",
                              value: el.average.toFixed(2),
                              fill: "#F3D17C",
                              fontSize: 12,
                            }}
                            strokeWidth={3}
                          />
                          <XAxis
                            dataKey="week"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                          />

                          <Bar
                            dataKey="value"
                            fill="var(--color-value)"
                            radius={4}
                            label={{
                              fill: theme == "dark" ? "white" : "black",
                              position: "top",
                            }}
                          />
                        </BarChart>
                      </ChartContainer>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          );
        })}
      </div>

      {!isSubscribed && (
        <div className="flex justify-center">
          <button
            className="mt-4 bg-green-600 text-white px-4 py-2"
            onClick={() => {
              window.location.href = "/dashboard/subscribe";
            }}
          >
            Subscribe to Premium
          </button>
        </div>
      )}
    </ProtectedRoute>
  );
}
