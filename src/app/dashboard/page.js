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
import {
  Moon,
  Sun,
  ListFilter,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useTheme } from "next-themes";
import { ChartContainer } from "@/components/ui/chart";
import { Bar, BarChart, ReferenceLine, XAxis } from "recharts";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  getTodayDateFormatted,
  parseDateFromString,
  formatDateToString,
} from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useWindowSize } from "usehooks-ts";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dailyTips, setDailyTips] = useState([]);
  const [filteredDailyTips, setFilteredDailyTips] = useState([]);
  const { theme, setTheme } = useTheme();
  const [selectedTip, setSelectedTip] = useState("");
  const [selectedTournament, setSelectedTournament] = useState("");
  const [filterChoosen, setFilterChoosen] = useState("home_teams_first");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [totalPremiumTips, setTotalPremiumTips] = useState(0);
  const [selectedDate, setSelectedDate] = useState(
    parseDateFromString(getTodayDateFormatted())
  );
  const [isCalendarDialogOpen, setIsCalendarDialogOpen] = useState(false);
  const { width: screenWidth } = useWindowSize();

  useEffect(() => {
    const getUserAndSubscription = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        setLoading(false);
        // window.location.href = "/login?r=session_expired";
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

  const fetchDailyTips = async () => {
    const response = await fetch("/api/daily-tips", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isSubscribed,
        selectedDate: formatDateToString(selectedDate),
      }),
    });

    if (response.ok) {
      const data = await response.json();
      setDailyTips(data);
      setFilteredDailyTips(data);
      console.log("Daily Tips:", data);
    } else {
      console.error("Failed to fetch daily tips");
    }
  };

  const fetchTotalPremiumTips = async () => {
    const response = await fetch(
      `/api/count-premium-tips?selectedDate=${encodeURIComponent(
        formatDateToString(selectedDate)
      )}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const { premiumCount } = await response.json();
      setTotalPremiumTips(premiumCount);
    } else {
      console.log("Failed to fetch total premium tips");
    }
  };

  useEffect(() => {
    const fetchAvailableDates = async () => {
      const response = await fetch("/api/available-dates", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const { dates } = await response.json();
        console.log("dates>>>", dates); // TODO: Make Calendar interact with available dates
      } else {
        console.log("Failed to fetch available dates");
      }
    };

    fetchDailyTips();
    fetchTotalPremiumTips();
    fetchAvailableDates();
  }, [isSubscribed]);

  const handleDarkMode = () => {
    if (theme === "system") setTheme("dark");
    else setTheme(theme === "dark" ? "light" : "dark");
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

  const roundToOddsFormat = (number) => {
    const rounded = Math.round(number * 2) / 2; // Round to nearest 0.5
    if (rounded % 1 === 0) {
      // If it's a whole number (e.g. 3.0), add 0.5 to match odds format
      return (rounded + 0.5).toFixed(1);
    }
    return rounded.toFixed(1); // Already in .5 format
  };

  const getUniqueValues = (key) => {
    const uniqueSet = new Set();

    for (const item of dailyTips) {
      if (item[key] !== undefined && item[key] !== null) {
        uniqueSet.add(item[key]);
      }
    }

    return Array.from(uniqueSet);
  };

  const filterByKeyValue = (key, value) => {
    return dailyTips.filter((item) => item[key] === value);
  };

  const sortByKey = (data, key, order = "desc") => {
    return [...data].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (order === "asc") {
        return aVal - bVal;
      } else {
        return bVal - aVal;
      }
    });
  };

  const handleFilterChange = () => {
    if (filterChoosen == "home_teams_first") {
      setSelectedTournament("");
    } else if (filterChoosen == "most_assertive") {
      setFilteredDailyTips(
        sortByKey(filteredDailyTips, "team_overall_assertivity_this_mando")
      );
    } else if (filterChoosen == "highest_suggested_odd") {
      setFilteredDailyTips(
        sortByKey(filteredDailyTips, "suggested_minimal_odd")
      );
    }

    setIsDialogOpen(false);
  };

  useEffect(() => {
    if (!selectedTournament.length) setFilteredDailyTips(dailyTips);
    else
      setFilteredDailyTips(filterByKeyValue("tournament", selectedTournament));
  }, [selectedTournament]);

  useEffect(() => {
    setLoading(true);
    fetchDailyTips();
    fetchTotalPremiumTips();
    setLoading(false);
  }, [selectedDate]);

  const handleTournamentSelection = (selection) => {
    if (selectedTournament.length && selectedTournament == selection)
      setSelectedTournament("");
    else setSelectedTournament(selection);
  };

  const callLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const callSubscribe = () => {
    window.location.href = "/premium";
  };

  const handleTopRightButton = () => {
    if (isSubscribed) callLogout();
    else callSubscribe();
  };

  function groupByMatchName(dataArray) {
    return dataArray.reduce((acc, item) => {
      const matchName = item.match_name;

      if (!acc[matchName]) {
        acc[matchName] = [];
      }

      acc[matchName].push(item);
      return acc;
    }, {});
  }

  const getDateFromData = () => {
    const dataDate = dailyTips.length > 0 && dailyTips[0].date;

    if (dataDate) return dataDate;

    return "Today";
  };

  const getAssertivityFromData = () => {
    if (!Array.isArray(dailyTips) || dailyTips.length === 0) return "0";

    const trueCount = dailyTips.filter((item) => item.result === true).length;
    const totalCount = dailyTips.length;

    const assertivity = ((trueCount / totalCount) * 100).toFixed(2);

    if (assertivity > 50) {
      return (
        <span className="flex items-center">
          <span className="flex gap-1">
            <ArrowUpRight className="text-[#40e340]" />
            <span className="bg-[#40e340] text-black rounded border p-1">
              {assertivity}%
            </span>
          </span>
          &nbsp;Assertivity
        </span>
      );
    } else {
      return (
        <span className="flex items-center">
          <span className="flex gap-1">
            <ArrowDownRight className="text-[#e3404b]" />
            <span className="bg-[#e3404b] text-black rounded border p-1">
              {assertivity}%
            </span>
          </span>
          &nbsp;Assertivity
        </span>
      );
    }
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <ProtectedRoute>
      <div className="p-4">
        <div className="flex justify-between">
          <h1 className="text-2xl mb-4">GOATIPS</h1>

          <div className="flex full justify-between content-center gap-4">
            <Button
              variant="outline"
              onClick={handleDarkMode}
              className="relative"
            >
              {theme === "dark" ? (
                <Sun className="h-[1.2rem] w-[1.2rem]" />
              ) : (
                <Moon className="h-[1.2rem] w-[1.2rem]" />
              )}
            </Button>

            <Button onClick={handleTopRightButton}>
              {isSubscribed ? "Logout" : `+${totalPremiumTips} Tips`}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 items-center w-full">
          <div
            id="dialogs-sorting-filtering"
            className="w-full flex justify-start"
          >
            <Dialog
              open={isCalendarDialogOpen}
              onOpenChange={setIsCalendarDialogOpen}
            >
              <Button
                onClick={() => {
                  setIsCalendarDialogOpen(true);
                }}
                size="icon"
                variant="secondary"
                className="mr-4"
              >
                <CalendarDays />
              </Button>

              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Pick a Date</DialogTitle>
                </DialogHeader>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => {
                    setSelectedDate(d);
                    setIsCalendarDialogOpen(false);
                  }}
                  className="rounded-lg border w-full"
                />
              </DialogContent>
            </Dialog>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <Button
                onClick={() => {
                  setIsDialogOpen(true);
                }}
                size="icon"
                variant="secondary"
                className="mr-4"
              >
                <ListFilter />
              </Button>

              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Filter</DialogTitle>
                </DialogHeader>
                <RadioGroup
                  defaultValue="home_teams_first"
                  onValueChange={(r) => setFilterChoosen(r)}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="home_teams_first" id="r1" />
                    <Label htmlFor="r1">{`Home teams first`}</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="most_assertive" id="r2" />
                    <Label htmlFor="r2">{`Most->Least assertive teams`}</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="highest_suggested_odd" id="r3" />
                    <Label htmlFor="r3">{`Highest->Lowest suggested odd`}</Label>
                  </div>
                </RadioGroup>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      onClick={() => {
                        setIsDialogOpen(false);
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button onClick={handleFilterChange} type="submit">
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-col w-full justify-center">
            <ScrollArea style={{ maxWidth: screenWidth }}>
              <div id="infos" className="flex gap-3 items-center min-w-max">
                <p className="text-sm">{`${filteredDailyTips.length} tips available`}</p>
                <p id="separator" className="text-sm">
                  |
                </p>
                <p className="text-sm">{`${getDateFromData()}`}</p>
                <p id="separator" className="text-sm">
                  |
                </p>
                <p className="text-sm">{getAssertivityFromData()}</p>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <Separator className="mt-3" />
            <div className="flex flex-col">
              <p className="text-sm mt-2">Available Leagues</p>
              <ScrollArea
                style={{ maxWidth: screenWidth }}
                className="flex my-2 gap-3"
              >
                {getUniqueValues("tournament").map((item, idx) => (
                  <Button
                    key={`tournament-${idx + 1}`}
                    variant="outline"
                    onClick={() => {
                      handleTournamentSelection(item);
                    }}
                    className={
                      selectedTournament == item
                        ? "border-primary bg-primary text-white dark:bg-white dark:text-gray-950"
                        : ""
                    }
                  >
                    {item}
                  </Button>
                ))}
              </ScrollArea>
            </div>
          </div>
        </div>

        <div className="flex justify-between"></div>

        {Object.entries(groupByMatchName(filteredDailyTips)).map(
          ([matchName, tips]) => (
            <div key={matchName} className="mb-6">
              <h2 className="text-xl font-bold mb-2">{matchName}</h2>

              {tips.map((el, index) => (
                <Accordion
                  type="single"
                  collapsible
                  className="w-full"
                  onValueChange={(tip) => {
                    setSelectedTip(tip);
                  }}
                  key={`acc-${matchName}-${index}`}
                >
                  <AccordionItem
                    value={`${matchName}-item-${index + 1}`}
                    className={`transition-all duration-200 ${
                      selectedTip === `item-${index + 1}`
                        ? "border border-1 border-gray-950 dark:border-gray-100 my-2 p-4"
                        : "border border-transparent"
                    }`}
                  >
                    <AccordionTrigger>
                      <div className="flex w-full justify justify-between">
                        <span>
                          {`${el.team} ${el.call} ${roundToOddsFormat(
                            el.average
                          )} ${el.stat}`}
                        </span>
                        <div>
                          <span>{el.result ? "✅" : "❌"} </span>
                          <span>{`Min. Odd: ${el.suggested_minimal_odd}`}</span>
                        </div>
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
              ))}
            </div>
          )
        )}
      </div>
      <div id="footer" className="flex justify-end text-white light:text-black">
        <p className="text-sm p-4">GOATIPS Dashboard | v1.0.0</p>
      </div>
    </ProtectedRoute>
  );
}
