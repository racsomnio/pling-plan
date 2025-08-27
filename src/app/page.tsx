"use client";

import { useState } from "react";
import { Plus, Calendar, Clock, Users, Target, CheckCircle } from "lucide-react";
import Link from "next/link";

interface Plan {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  participants: number;
  status: "upcoming" | "completed" | "cancelled";
}

export default function Home() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  const filteredPlans = plans.filter(plan => 
    activeTab === "upcoming" ? plan.status === "upcoming" : plan.status === "completed"
  );

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/75">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Pling Plan</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="text-gray-400 hover:text-white transition-colors">
              <Calendar className="w-5 h-5" />
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </button>
            <Link 
              href="/create"
              className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Plan</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-gray-800">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-8">
            <button className="text-white font-medium border-b-2 border-white pb-2">
              Plans
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              Calendars
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              Discover
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Plans</h1>
          <div className="flex space-x-2 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "upcoming"
                  ? "bg-white text-gray-900"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "past"
                  ? "bg-white text-gray-900"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Past
            </button>
          </div>
        </div>

        {filteredPlans.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">
              No {activeTab === "upcoming" ? "Upcoming" : "Past"} Plans
            </h2>
            <p className="text-gray-400 mb-6">
              {activeTab === "upcoming" 
                ? "You have no upcoming plans. Why not create one?"
                : "You have no past plans yet."
              }
            </p>
            {activeTab === "upcoming" && (
              <Link
                href="/create"
                className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center space-x-2 mx-auto w-fit"
              >
                <Plus className="w-5 h-5" />
                <span>Create Plan</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{plan.title}</h3>
                    {plan.description && (
                      <p className="text-gray-400 mb-4">{plan.description}</p>
                    )}
                    <div className="flex items-center space-x-6 text-sm text-gray-400">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{plan.date}</span>
                      </div>
                      {plan.time && (
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{plan.time}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{plan.participants} participant{plan.participants !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {plan.status === "completed" && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
