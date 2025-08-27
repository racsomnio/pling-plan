"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface CalendarPickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function CalendarPicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  isOpen,
  onClose,
}: CalendarPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Debug props when they change
  useEffect(() => {
    console.log('CalendarPicker props updated:', {
      startDate: startDate?.toDateString(),
      endDate: endDate?.toDateString(),
      isOpen
    });
  }, [startDate, endDate, isOpen]);

  if (!isOpen) return null;

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const isDateInRange = (date: Date) => {
    if (!startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
  };

  const isStartDate = (date: Date) => {
    return startDate && date.toDateString() === startDate.toDateString();
  };

  const isEndDate = (date: Date) => {
    return endDate && date.toDateString() === endDate.toDateString();
  };

  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date.toDateString());
    console.log('Current startDate:', startDate?.toDateString());
    console.log('Current endDate:', endDate?.toDateString());
    
    if (!startDate || (startDate && endDate)) {
      // Start new selection
      console.log('Starting new selection');
      onStartDateChange(date);
      onEndDateChange(null);
    } else {
      // Complete selection
      console.log('Completing selection');
      if (date >= startDate) {
        onEndDateChange(date);
      } else {
        onEndDateChange(startDate);
        onStartDateChange(date);
      }
    }
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-black/80 backdrop-blur rounded-lg p-6 border border-white/20 shadow-xl max-w-sm w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Select Date Range</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-2 text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h4 className="text-white font-medium">
            {formatMonthYear(currentMonth)}
          </h4>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-2 text-white/60 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs text-white/60 font-medium py-2">
              {day}
            </div>
          ))}
          
          {days.map((date, index) => (
            <div key={index} className="aspect-square">
              {date ? (
                <button
                  onClick={() => handleDateClick(date)}
                  className={`w-full h-full rounded-md text-sm font-medium transition-all cursor-pointer ${
                    isStartDate(date)
                      ? 'bg-white text-gray-900'
                      : isEndDate(date)
                      ? 'bg-white text-gray-900'
                      : isDateInRange(date)
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {date.getDate()}
                </button>
              ) : (
                <div className="w-full h-full" />
              )}
            </div>
          ))}
        </div>

        {/* Date Range Display */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-white rounded-full"></div>
            <span className="text-white/80">Start:</span>
            <span className="text-white">
              {startDate ? startDate.toLocaleDateString() : 'Not selected'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 border-2 border-white/60 rounded-full"></div>
            <span className="text-white/80">End:</span>
            <span className="text-white">
              {endDate ? endDate.toLocaleDateString() : 'Not selected'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-white/20 rounded-md text-white hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white text-gray-900 rounded-md font-medium hover:bg-gray-100 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
