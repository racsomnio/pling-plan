"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, Activity, Bed, Plane, Car, Utensils } from "lucide-react";
// import Link from "next/link";
import PlacePicker from "../../../../components/PlacePicker";
import ActivityCreator, { ActivityItem, ActivityTag } from "../../../../components/ActivityCreator";
import ChatWidget from "../../../../components/ChatWidget";

interface Plan {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  image: string;
  backgroundColor: string;
}

export default function PlanManagePage({ params }: { params: Promise<{ id: string }> }) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [planId, setPlanId] = useState<string>("");
  const [showPlacePicker, setShowPlacePicker] = useState(false); // deprecated by ActivityCreator, keep if needed
  const [showActivityCreator, setShowActivityCreator] = useState(false);
  interface PlannedActivity extends ActivityItem { date: string }
  const [activities, setActivities] = useState<PlannedActivity[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Handle async params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setPlanId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  // Mock plan data - in a real app, this would come from your backend
  useEffect(() => {
    if (!planId) return;
    
    // For demo purposes, create a sample plan
    const samplePlan: Plan = {
      id: planId,
      name: "Summer Vacation Plan",
      startDate: new Date("2025-08-12"),
      endDate: new Date("2025-08-26"),
      image: "", // You can add a default image here
      backgroundColor: "bg-gradient-to-br from-purple-500 to-pink-500",
    };
    setPlan(samplePlan);
  }, [planId]);

  // Ensure we have a selected date (default to startDate) — must be before any early returns
  useEffect(() => {
    if (!plan) return;
    if (!selectedDate) {
      setSelectedDate(plan.startDate);
    }
  }, [plan, selectedDate]);

  const generateDateRange = (startDate: Date, endDate: Date) => {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

  const formatDayOfWeek = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short'
    });
  };

  // Elegant date range: "Aug 11 – 25, 2025" or "Aug 28 – Sep 3, 2025"
  // If years differ: "Dec 30, 2025 – Jan 2, 2026"
  const formatDateRange = (startDate: Date, endDate: Date) => {
    const sMonth = startDate.toLocaleString('en-US', { month: 'short' });
    const eMonth = endDate.toLocaleString('en-US', { month: 'short' });
    const sDay = startDate.getDate();
    const eDay = endDate.getDate();
    const sYear = startDate.getFullYear();
    const eYear = endDate.getFullYear();

    const dash = " – ";

    if (sYear !== eYear) {
      return `${sMonth} ${sDay}, ${sYear}${dash}${eMonth} ${eDay}, ${eYear}`;
    }

    if (sMonth === eMonth) {
      return `${sMonth} ${sDay}${dash}${eDay}, ${sYear}`;
    }

    return `${sMonth} ${sDay}${dash}${eMonth} ${eDay}, ${sYear}`;
  };

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading plan...</div>
      </div>
    );
  }

  const dateRange = generateDateRange(plan.startDate, plan.endDate);

  const formatDateKey = (date: Date) => date.toISOString().slice(0, 10);
  const selectedDateKey = selectedDate ? formatDateKey(selectedDate) : null;
  const visibleActivities = selectedDateKey
    ? activities.filter(a => a.date === selectedDateKey)
    : activities;

  return (
    <div className={`min-h-screen ${plan.backgroundColor}`}>
      {/* Header */}
      <header className="border-b border-white/20 bg-black/20 backdrop-blur supports-[backdrop-filter]:bg-black/10">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-4">
            <a href="/" className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </a>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Pling Plan</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Plan Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-6 mb-8">
            {/* Image Thumbnail */}
            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-lg bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center overflow-hidden">
              {plan.image ? (
                <img 
                  src={plan.image} 
                  alt={plan.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Calendar className="w-8 h-8 lg:w-10 lg:h-10 text-white/50" />
              )}
            </div>

            {/* Plan Name and Date Range */}
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
                {plan.name}
              </h1>
              
              {/* Elegant Date Range Display */}
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-white/90 text-lg font-medium">
                  {formatDateRange(plan.startDate, plan.endDate)}
                </span>
              </div>
              
              {/* Total Days */}
              <p className="text-white/70 text-sm">
                {dateRange.length} day{dateRange.length !== 1 ? 's' : ''} total
              </p>
            </div>
          </div>

          {/* Timeline */
          }
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 sm:p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Timeline</h2>
            
            {/* Horizontal Scrollable Timeline */}
            <div className="relative">
              {/* Scroll Buttons */}
              <button className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Timeline Container */}
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex space-x-4 min-w-max pb-4">
                  {dateRange.map((date, index) => {
                    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(date)}
                        className={`flex-shrink-0 w-20 sm:w-24 rounded-lg p-3 text-center transition-colors border ${
                          isSelected
                            ? "bg-white/20 border-white/40 text-white"
                            : "bg-white/10 backdrop-blur border-white/20 text-white"
                        }`}
                      >
                        <div className="text-white/60 text-xs font-medium mb-1">
                          {formatDayOfWeek(date)}
                        </div>
                        <div className="text-white text-lg font-bold">
                          {date.getDate()}
                        </div>
                        <div className="text-white/60 text-xs">
                          {date.toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Activities list */}
          {visibleActivities.length > 0 && (
            <div className="mb-6">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
                <h3 className="text-white font-semibold mb-3">Activities {selectedDate && (
                  <span className="text-white/60 font-normal">for {selectedDate.toLocaleDateString()}</span>
                )}</h3>
                <div className="space-y-3">
                  {visibleActivities.map(a => (
                    <div key={a.id} className="rounded-lg border border-white/20 bg-white/5 p-3">
                      <div className="text-white font-medium">{a.name}</div>
                      {a.address && <div className="text-white/60 text-sm">{a.address}</div>}
                      {a.notes && (
                        <div className="text-white/80 text-sm mt-2 p-2 bg-white/5 rounded border-l-2 border-white/20">
                          {a.notes}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2 items-center text-xs text-white/70">
                        {a.time && <span className="px-2 py-1 rounded-full border border-white/20 bg-white/10">{a.time}</span>}
                        {a.tags.map(t => (
                          <span key={t} className="px-2 py-1 rounded-full border border-white/20 bg-white/10">{t.replace("_", " ")}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Add to plan */}
          <div className="mt-8">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 sm:p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Add to plan</h3>
                <span className="text-white/60 text-sm">Quick actions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowActivityCreator(true)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur px-3 py-2 text-xs font-medium text-white border border-white/20 hover:bg-white/15 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                  aria-label="Add activity"
                >
                  <Activity className="w-4 h-4 text-white" /> Activity
                </button>
                <button
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur px-3 py-2 text-xs font-medium text-white border border-white/20 hover:bg-white/15 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                  aria-label="Add stay"
                >
                  <Bed className="w-4 h-4 text-white" /> Stay
                </button>
                <button
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur px-3 py-2 text-xs font-medium text-white border border-white/20 hover:bg-white/15 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                  aria-label="Add food"
                >
                  <Utensils className="w-4 h-4 text-white" /> Food
                </button>
                <button
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur px-3 py-2 text-xs font-medium text-white border border-white/20 hover:bg-white/15 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                  aria-label="Add flight"
                >
                  <Plane className="w-4 h-4 text-white" /> Flight
                </button>
                <button
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur px-3 py-2 text-xs font-medium text-white border border-white/20 hover:bg-white/15 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                  aria-label="Add commute"
                >
                  <Car className="w-4 h-4 text-white" /> Commute
                </button>
              </div>
            </div>
          </div>

          {showActivityCreator && (
            <ActivityCreator
              isOpen={showActivityCreator}
              onClose={() => setShowActivityCreator(false)}
              onAdd={(activity) => {
                const dateToUse = selectedDate ?? plan.startDate;
                setActivities(prev => [{ ...activity, date: formatDateKey(dateToUse) }, ...prev]);
                setShowActivityCreator(false);
              }}
            />
          )}

          {showPlacePicker && (
            <PlacePicker
              isOpen={showPlacePicker}
              onClose={() => setShowPlacePicker(false)}
              onConfirm={(place) => {
                console.log("Picked place:", place);
                setShowPlacePicker(false);
              }}
            />
          )}
        {/* Floating AI Chat */}
        <ChatWidget
          destination={plan.name}
          selectedDateISO={selectedDateKey}
          currentDayActivities={visibleActivities}
          onAddActivity={(s) => {
            const allowed: ActivityTag[] = ["must", "optional", "landmark", "popular", "hidden_gem"];
            const normalizedTags: ActivityTag[] = (s.tags || [])
              .map(t => t.toLowerCase().replace(" ", "_") as ActivityTag)
              .filter((t): t is ActivityTag => allowed.includes(t));
            const dateToUse = selectedDate ?? plan.startDate;
            const newItem: ActivityItem = {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              name: s.name,
              address: s.address || "",
              lat: s.lat ?? 0,
              lng: s.lng ?? 0,
              time: s.time,
              notes: s.notes,
              tags: normalizedTags,
            };
            setActivities(prev => [{ ...newItem, date: formatDateKey(dateToUse) }, ...prev]);
          }}
        />
      </div>
    </div>
    </div>
  );
}
