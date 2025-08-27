"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

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

  const generateDateRange = (startDate: Date, endDate: Date) => {
    const dates = [];
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

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading plan...</div>
      </div>
    );
  }

  const dateRange = generateDateRange(plan.startDate, plan.endDate);

  return (
    <div className={`min-h-screen ${plan.backgroundColor}`}>
      {/* Header */}
      <header className="border-b border-white/20 bg-black/20 backdrop-blur supports-[backdrop-filter]:bg-black/10">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </Link>
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
              
              {/* Simple Date Range Display */}
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-white/90 text-lg">
                  {plan.startDate.toLocaleDateString()} - {plan.endDate.toLocaleDateString()}
                </span>
              </div>
              
              {/* Total Days */}
              <p className="text-white/70 text-sm">
                {dateRange.length} day{dateRange.length !== 1 ? 's' : ''} total
              </p>
            </div>
          </div>

          {/* Timeline */}
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
                  {dateRange.map((date, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-20 sm:w-24 bg-white/10 backdrop-blur rounded-lg p-3 border border-white/20 text-center"
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
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 sm:p-6 border border-white/20 max-w-md">
              <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-white text-gray-900 py-2 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  Edit Plan
                </button>
                <button className="w-full border border-white/20 text-white py-2 px-4 rounded-lg font-medium hover:bg-white/10 transition-colors">
                  Share Plan
                </button>
                <button className="w-full border border-white/20 text-white py-2 px-4 rounded-lg font-medium hover:bg-white/10 transition-colors">
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
