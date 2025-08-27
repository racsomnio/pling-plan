"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Camera, Palette, Calendar, Globe } from "lucide-react";
import Link from "next/link";
import CalendarPicker from "../../components/CalendarPicker";

interface PlanForm {
  name: string;
  startDate: Date | null;
  endDate: Date | null;
  image: string;
  backgroundColor: string;
}

const backgroundColors = [
  { name: "Purple", value: "bg-gradient-to-br from-purple-500 to-pink-500" },
  { name: "Blue", value: "bg-gradient-to-br from-blue-500 to-cyan-500" },
  { name: "Green", value: "bg-gradient-to-br from-green-500 to-emerald-500" },
  { name: "Orange", value: "bg-gradient-to-br from-orange-500 to-red-500" },
  { name: "Teal", value: "bg-gradient-to-br from-teal-500 to-blue-500" },
  { name: "Pink", value: "bg-gradient-to-br from-pink-500 to-rose-500" },
];

export default function CreatePage() {
  const [plan, setPlan] = useState<PlanForm>({
    name: "",
    startDate: null,
    endDate: null,
    image: "",
    backgroundColor: "bg-gradient-to-br from-purple-500 to-pink-500",
  });

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Debug plan state changes
  useEffect(() => {
    console.log('Plan state updated:', {
      startDate: plan.startDate?.toDateString(),
      endDate: plan.endDate?.toDateString(),
      name: plan.name
    });
  }, [plan.startDate, plan.endDate, plan.name]);

  const handleCreatePlan = () => {
    if (plan.name && plan.startDate) {
      // Generate a unique ID for the plan
      const planId = Date.now().toString();
      
      // Here you would typically save the plan to your backend
      console.log("Creating plan:", plan);
      
      // Navigate to the plan management page
      window.location.href = `/plan/manage/${planId}`;
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Select date";
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleStartDateChange = (date: Date | null) => {
    console.log('handleStartDateChange called with:', date?.toDateString());
    setPlan(prev => ({ ...prev, startDate: date }));
  };

  const handleEndDateChange = (date: Date | null) => {
    console.log('handleEndDateChange called with:', date?.toDateString());
    setPlan(prev => ({ ...prev, endDate: date }));
  };

  return (
    <div className={`min-h-screen ${plan.backgroundColor}`}>
      {/* Header */}
      <header className="border-b border-white/20 bg-black/20 backdrop-blur supports-[backdrop-filter]:bg-black/10">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/" className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                <Calendar className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-white">Pling Plan</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button className="text-white/80 hover:text-white transition-colors">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button className="text-white/80 hover:text-white transition-colors">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        {/* Left Column - Plan Visual */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center order-2 lg:order-1">
          <div className="w-full max-w-sm sm:max-w-md">
            {/* Plan Image/Preview */}
            <div className="relative mb-4 sm:mb-6">
              <div 
                className="w-full aspect-square rounded-lg bg-white/10 backdrop-blur flex items-center justify-center relative overflow-hidden border border-white/20"
              >
                {plan.image ? (
                  <img 
                    src={plan.image} 
                    alt="Plan preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-white text-center p-4">
                    <Camera className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-50" />
                    <p className="text-base sm:text-lg font-medium">Plan Preview</p>
                    <p className="text-xs sm:text-sm opacity-75">Upload an image to customize</p>
                  </div>
                )}
              </div>
            </div>

            {/* Theme Section - Hidden on mobile, shown on desktop */}
            <div className="hidden lg:block bg-white/10 backdrop-blur rounded-lg p-3 sm:p-4 border border-white/20 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded ${plan.backgroundColor}`} />
                  <span className="text-white font-medium text-sm sm:text-base">Theme</span>
                </div>
                <button 
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="text-white/80 hover:text-white flex items-center space-x-1"
                >
                  <Palette className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">Select</span>
                </button>
              </div>

              {/* Color Picker Dropdown */}
              {showColorPicker && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-black/80 backdrop-blur rounded-lg p-3 sm:p-4 border border-white/20 shadow-xl z-10">
                  <h3 className="text-sm font-medium mb-2 sm:mb-3 text-white">Background Color</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {backgroundColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => {
                          setPlan({ ...plan, backgroundColor: color.value });
                          setShowColorPicker(false);
                        }}
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${color.value} border-2 transition-all ${
                          plan.backgroundColor === color.value 
                            ? 'border-white scale-110' 
                            : 'border-transparent hover:scale-105'
                        }`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Plan Form */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-white/20 order-1 lg:order-2">
          <div className="max-w-sm sm:max-w-md mx-auto lg:mx-0">
            {/* Plan Name */}
            <div className="mb-6 sm:mb-8">
              <input
                type="text"
                value={plan.name}
                onChange={(e) => setPlan({ ...plan, name: e.target.value })}
                placeholder="Plan Name"
                className="w-full text-2xl sm:text-3xl font-bold bg-transparent border-none outline-none text-white placeholder-white/50"
              />
            </div>

            {/* Date Range */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-white rounded-full flex-shrink-0"></div>
                  <span className="text-white/80 text-sm sm:text-base">Start</span>
                </div>
                <button
                  onClick={() => setShowCalendar(true)}
                  className="flex-1 px-3 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-md text-white hover:bg-white/20 transition-colors text-left text-sm sm:text-base"
                >
                  {formatDate(plan.startDate)}
                </button>
                
                {/* Dotted Line Separator */}
                <div className="flex items-center space-x-1">
                  <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                  <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                  <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 border-2 border-white/60 rounded-full flex-shrink-0"></div>
                  <span className="text-white/80 text-sm sm:text-base">End</span>
                </div>
                <button
                  onClick={() => setShowCalendar(true)}
                  className="flex-1 px-3 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-md text-white hover:bg-white/20 transition-colors text-left text-sm sm:text-base"
                >
                  {formatDate(plan.endDate)}
                </button>
              </div>
            </div>

            {/* Image Upload */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-medium text-white mb-2">Add Plan Image</h3>
              <p className="text-white/60 text-xs sm:text-sm mb-3 sm:mb-4">Upload an image to make your plan stand out</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      setPlan({ ...plan, image: e.target?.result as string });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full px-3 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-md text-white focus:outline-none focus:border-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs sm:file:text-sm file:font-medium file:bg-white file:text-gray-900 hover:file:bg-gray-100 text-xs sm:text-sm"
              />
            </div>

            {/* Theme Section - Mobile Only */}
            <div className="lg:hidden mb-6 sm:mb-8">
              <div className="bg-white/10 backdrop-blur rounded-lg p-3 sm:p-4 border border-white/20 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded ${plan.backgroundColor}`} />
                    <span className="text-white font-medium text-sm sm:text-base">Theme</span>
                  </div>
                  <button 
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="text-white/80 hover:text-white flex items-center space-x-1"
                  >
                    <Palette className="w-4 h-4" />
                    <span className="text-xs sm:text-sm">Select</span>
                  </button>
                </div>

                {/* Color Picker Dropdown */}
                {showColorPicker && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-black/80 backdrop-blur rounded-lg p-3 sm:p-4 border border-white/20 shadow-xl z-10">
                    <h3 className="text-sm font-medium mb-2 sm:mb-3 text-white">Background Color</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {backgroundColors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => {
                            setPlan({ ...plan, backgroundColor: color.value });
                            setShowColorPicker(false);
                          }}
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${color.value} border-2 transition-all ${
                            plan.backgroundColor === color.value 
                              ? 'border-white scale-110' 
                              : 'border-transparent hover:scale-105'
                          }`}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreatePlan}
              disabled={!plan.name || !plan.startDate}
              className="w-full bg-white text-gray-900 py-3 px-6 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              Create Plan
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Picker Modal */}
      <CalendarPicker
        startDate={plan.startDate}
        endDate={plan.endDate}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
      />
    </div>
  );
}
