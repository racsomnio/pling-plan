"use client";

import { useState, useEffect, use, useRef } from "react";
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, Activity, Bed, Plane, Car, Utensils } from "lucide-react";

// Helper function to convert Google Places types to user-friendly categories
const getCategoryFromTypes = (types: string[] = []): string => {
  const typeMap: { [key: string]: string } = {
    'restaurant': 'Restaurant',
    'food': 'Food',
    'meal_takeaway': 'Takeaway',
    'cafe': 'Cafe',
    'bar': 'Bar',
    'tourist_attraction': 'Attraction',
    'museum': 'Museum',
    'art_gallery': 'Gallery',
    'park': 'Park',
    'zoo': 'Zoo',
    'aquarium': 'Aquarium',
    'lodging': 'Hotel',
    'hotel': 'Hotel',
    'shopping_mall': 'Shopping',
    'store': 'Store',
    'clothing_store': 'Shopping',
    'electronics_store': 'Electronics',
    'book_store': 'Bookstore',
    'gas_station': 'Gas Station',
    'hospital': 'Hospital',
    'pharmacy': 'Pharmacy',
    'bank': 'Bank',
    'atm': 'ATM',
    'post_office': 'Post Office',
    'police': 'Police',
    'fire_station': 'Fire Station',
    'school': 'School',
    'university': 'University',
    'church': 'Church',
    'mosque': 'Mosque',
    'synagogue': 'Synagogue',
    'hindu_temple': 'Temple',
    'cemetery': 'Cemetery',
    'funeral_home': 'Funeral Home',
    'embassy': 'Embassy',
    'local_government_office': 'Government',
    'city_hall': 'City Hall',
    'courthouse': 'Courthouse',
    'library': 'Library',
    'movie_theater': 'Cinema',
    'night_club': 'Nightclub',
    'casino': 'Casino',
    'spa': 'Spa',
    'gym': 'Gym',
    'beauty_salon': 'Beauty Salon',
    'hair_care': 'Hair Salon',
    'laundry': 'Laundry',
    'car_repair': 'Car Repair',
    'car_wash': 'Car Wash',
    'parking': 'Parking',
    'subway_station': 'Subway',
    'train_station': 'Train Station',
    'bus_station': 'Bus Station',
    'airport': 'Airport',
    'taxi_stand': 'Taxi',
    'car_rental': 'Car Rental',
    'bicycle_store': 'Bike Shop',
    'travel_agency': 'Travel Agency',
    'real_estate_agency': 'Real Estate',
    'insurance_agency': 'Insurance',
    'accounting': 'Accounting',
    'lawyer': 'Lawyer',
    'dentist': 'Dentist',
    'doctor': 'Doctor',
    'veterinary_care': 'Veterinarian',
    'pet_store': 'Pet Store',
    'florist': 'Florist',
    'furniture_store': 'Furniture',
    'home_goods_store': 'Home Goods',
    'hardware_store': 'Hardware',
    'garden_center': 'Garden Center',
    'liquor_store': 'Liquor Store',
    'convenience_store': 'Convenience Store',
    'supermarket': 'Supermarket',
    'grocery_or_supermarket': 'Grocery Store',
    'bakery': 'Bakery',
    'butcher_shop': 'Butcher',
    'seafood': 'Seafood',
    'ice_cream_shop': 'Ice Cream',
    'candy_store': 'Candy Store',
    'coffee_shop': 'Coffee Shop',
    'tea_house': 'Tea House',
    'juice_bar': 'Juice Bar',
    'smoothie_bar': 'Smoothie Bar',
    'sandwich_shop': 'Sandwich Shop',
    'pizza_place': 'Pizza',
    'hamburger_restaurant': 'Burger',
    'fast_food_restaurant': 'Fast Food',
    'steak_house': 'Steakhouse',
    'seafood_restaurant': 'Seafood Restaurant',
    'italian_restaurant': 'Italian',
    'chinese_restaurant': 'Chinese',
    'japanese_restaurant': 'Japanese',
    'korean_restaurant': 'Korean',
    'thai_restaurant': 'Thai',
    'indian_restaurant': 'Indian',
    'mexican_restaurant': 'Mexican',
    'french_restaurant': 'French',
    'german_restaurant': 'German',
    'spanish_restaurant': 'Spanish',
    'greek_restaurant': 'Greek',
    'turkish_restaurant': 'Turkish',
    'lebanese_restaurant': 'Lebanese',
    'middle_eastern_restaurant': 'Middle Eastern',
    'african_restaurant': 'African',
    'brazilian_restaurant': 'Brazilian',
    'peruvian_restaurant': 'Peruvian',
    'argentine_restaurant': 'Argentine',
    'vegetarian_restaurant': 'Vegetarian',
    'vegan_restaurant': 'Vegan',
    'gluten_free_restaurant': 'Gluten Free',
    'kosher_restaurant': 'Kosher',
    'halal_restaurant': 'Halal',
  };

  // Find the first matching type
  for (const type of types) {
    if (typeMap[type]) {
      return typeMap[type];
    }
  }

  // If no specific match, return a generic category based on common patterns
  if (types.some(t => t.includes('restaurant') || t.includes('food'))) return 'Restaurant';
  if (types.some(t => t.includes('tourist') || t.includes('attraction'))) return 'Attraction';
  if (types.some(t => t.includes('lodging') || t.includes('hotel'))) return 'Hotel';
  if (types.some(t => t.includes('store') || t.includes('shopping'))) return 'Shopping';
  if (types.some(t => t.includes('entertainment') || t.includes('theater'))) return 'Entertainment';
  
  return 'Place';
};

import Link from "next/link";
import PlacePicker from "../../../../components/PlacePicker";
import ActivityCreator, { ActivityItem, ActivityTag } from "../../../../components/ActivityCreator";
import ChatWidget from "../../../../components/ChatWidget";

// Mapbox Map Component
function MapboxMap({ activities, city }: { activities: ActivityItem[], city: any }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || activities.length === 0) return;

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!mapboxToken) {
      console.warn("Mapbox token not found");
      return;
    }

    // Load Mapbox GL JS dynamically
    const loadMapbox = async () => {
      try {
        // Dynamic import for client-side only
        const mapboxgl = await import('mapbox-gl');
        mapboxgl.default.accessToken = mapboxToken;

        // Calculate bounds for all activities
        const validActivities = activities.filter(a => a.lat && a.lng);
        if (validActivities.length === 0) return;

        const lats = validActivities.map(a => a.lat!);
        const lngs = validActivities.map(a => a.lng!);
        
        const bounds = new mapboxgl.default.LngLatBounds();
        validActivities.forEach(activity => {
          bounds.extend([activity.lng!, activity.lat!]);
        });

        // Create map
        const map = new mapboxgl.default.Map({
          container: mapRef.current!,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: city?.lat && city?.lng ? [city.lng, city.lat] : [lngs.reduce((a, b) => a + b) / lngs.length, lats.reduce((a, b) => a + b) / lats.length],
          zoom: 10,
          interactive: false, // Disable interaction for mini map
          attributionControl: false,
        });

        mapInstanceRef.current = map;

        map.on('load', () => {
          // Fit map to bounds
          map.fitBounds(bounds, { padding: 20 });

          // Add markers for each activity
          validActivities.forEach((activity, index) => {
            const el = document.createElement('div');
            el.className = 'w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg';
            el.style.cursor = 'pointer';

            new mapboxgl.default.Marker(el)
              .setLngLat([activity.lng!, activity.lat!])
              .setPopup(new mapboxgl.default.Popup({ offset: 25 }).setHTML(`<div class="text-sm font-medium">${activity.name}</div>`))
              .addTo(map);
          });
        });

      } catch (error) {
        console.error('Error loading Mapbox:', error);
      }
    };

    loadMapbox();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [activities, city]);

  return (
    <div ref={mapRef} className="w-full h-full rounded-lg">
      {/* Fallback content when map fails to load */}
      <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-white/60 text-xs rounded-lg">
        <div className="text-center">
          <div className="text-xs font-medium">{activities.length}</div>
          <div className="text-xs opacity-60">locations</div>
        </div>
      </div>
    </div>
  );
}

interface Plan {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  image: string;
  backgroundColor: string;
  city: {
    name: string;
    state?: string;
    country: string;
    lat?: number;
    lng?: number;
  } | null;
}

export default function PlanManagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: planId } = use(params);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [showActivityCreator, setShowActivityCreator] = useState(false);
  const [showPlacePicker, setShowPlacePicker] = useState(false);

  // Mock data for now
  useEffect(() => {
    const samplePlan: Plan = {
      id: planId,
      name: "Summer Vacation Plan",
      startDate: new Date("2025-08-12"),
      endDate: new Date("2025-08-26"),
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center",
      backgroundColor: "bg-gradient-to-br from-purple-500 to-pink-500",
      city: {
        name: "San Francisco",
        state: "CA",
        country: "USA",
        lat: 37.7749,
        lng: -122.4194
      }
    };
    setPlan(samplePlan);
  }, [planId]);

  const generateDateRange = (start: Date, end: Date) => {
    const dates = [];
    const current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const formatDateRange = (start: Date, end: Date) => {
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  const formatDayOfWeek = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
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
  const visibleActivities: ActivityItem[] = []; // Activities only appear in bucket list, not in day view

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
        <div className="max-w-7xl mx-auto">
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
              
              {/* City Information */}
              {plan.city && (
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-5 h-5 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white/90 text-lg font-medium">
                    {plan.city.name}
                    {plan.city.state && `, ${plan.city.state}`}
                    {plan.city.country && `, ${plan.city.country}`}
                  </span>
                </div>
              )}
              
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

          {/* Main Layout: Timeline + Bucket List */}
          <div className="flex flex-col xl:flex-row gap-6">
            {/* Timeline Section - Takes remaining space */}
            <div className="flex-1 min-w-0">
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
                            {a.tags.map((t: string) => (
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
            </div>

            {/* Bucket List Section - Fixed width on desktop */}
            <div className="w-full xl:w-96 xl:max-w-96 xl:flex-shrink-0 relative">
              
              <div className="bg-white/10 backdrop-blur rounded-lg p-4 sm:p-6 border border-white/20 sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Bucket List</h2>
                  <span className="text-white/60 text-sm">
                    {activities.length} activit{activities.length !== 1 ? 'ies' : 'y'}
                  </span>
                </div>
                
                {activities.length > 0 ? (
                  <div className="space-y-3">
                    {activities.map((activity) => {
                      return (
                        <div key={activity.id} className="bg-white/5 backdrop-blur rounded-lg p-3 border border-white/20 hover:bg-white/10 transition-colors">
                          <div className="mb-2">
                            <h3 className="text-white font-medium text-sm leading-tight">{activity.name}</h3>
                          </div>
                          
                          {activity.notes && (
                            <p className="text-white/70 text-xs mb-2 line-clamp-2 italic">&quot;{activity.notes}&quot;</p>
                          )}
                          
                          <div className="flex flex-wrap gap-1">
                            {activity.types && activity.types.length > 0 && (
                              <span className="text-xs bg-green-500/20 text-green-200 px-2 py-1 rounded-full border border-green-400/30 font-medium">
                                {getCategoryFromTypes(activity.types)}
                              </span>
                            )}
                            {activity.tags.map((tag) => (
                              <span key={tag} className="text-xs bg-white/10 text-white/80 px-2 py-1 rounded-full border border-white/20">
                                {tag.replace("_", " ")}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Activity className="w-6 h-6 text-white/50" />
                    </div>
                    <h3 className="text-white/80 font-medium mb-2 text-sm">No activities yet</h3>
                    <p className="text-white/60 text-xs mb-3">Start building your bucket list</p>
                    <button
                      onClick={() => setShowActivityCreator(true)}
                      className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-2 rounded-lg text-white border border-white/20 hover:bg-white/15 transition-colors text-sm"
                    >
                      <Activity className="w-4 h-4" />
                      Add First Activity
                    </button>
                  </div>
                )}
                
                {/* Add to Bucket List Button */}
                <div className="mt-4">
                  <button
                    onClick={() => setShowActivityCreator(true)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur px-4 py-3 rounded-lg text-white border border-white/20 hover:bg-white/15 transition-colors font-medium text-sm"
                  >
                    <Activity className="w-4 h-4" />
                    Add to Bucket List
                  </button>
                </div>

                {/* Mapbox Map */}
                {activities.length > 0 && (
                  <div className="mt-4 w-full h-24 rounded-lg overflow-hidden border border-white/20 bg-white/5 mapbox-container">
                    <MapboxMap activities={activities} city={plan.city} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {showActivityCreator && (
            <ActivityCreator
              isOpen={showActivityCreator}
              onClose={() => setShowActivityCreator(false)}
              city={plan.city}
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
