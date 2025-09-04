"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, X } from "lucide-react";

interface City {
  id: string;
  name: string;
  country?: string;
  state?: string;
}

interface CityPickerProps {
  selectedCity: City | null;
  onCitySelect: (city: City | null) => void;
  onCityImageChange?: (imageUrl: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CityPicker({ 
  selectedCity, 
  onCitySelect, 
  onCityImageChange,
  placeholder = "Search for a city...",
  className = ""
}: CityPickerProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        searchCities(query);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync query with selectedCity when it changes externally
  useEffect(() => {
    if (selectedCity) {
      setQuery(selectedCity.name);
    }
  }, [selectedCity]);

  const searchCities = async (searchQuery: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/cities/search?q=${encodeURIComponent(searchQuery)}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.cities && data.cities.length > 0) {
          const citySuggestions = data.cities.map((city: any) => ({
            id: city.id,
            name: city.name,
            country: city.country,
            state: city.state
          }));
          
          setSuggestions(citySuggestions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } else {
        throw new Error('City search failed');
      }
    } catch (err) {
      setError("Failed to search cities");
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };



  const [imageOptions, setImageOptions] = useState<Array<{url: string; alt: string; photographer: string; unsplashUrl: string}>>([]);
  const [showImageOptions, setShowImageOptions] = useState(false);

  const fetchCityImage = async (city: City, sortBy: string = 'popular') => {
    if (!onCityImageChange) return;
    
    console.log("Starting to fetch city image for:", city, "with sort:", sortBy);
    setIsLoadingImage(true);
    
    const apiUrl = `/api/cities/image?city=${encodeURIComponent(city.name)}&country=${encodeURIComponent(city.country || '')}&sort=${sortBy}&multiple=true`;
    console.log("Calling API:", apiUrl);
    
    try {
      const response = await fetch(apiUrl);
      console.log("API response received:", response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log("City image API response:", data); // Debug log
        
        if (data.images && data.images.length > 0) {
          // Store multiple image options
          setImageOptions(data.images);
          setShowImageOptions(true);
          
          // Auto-select the first (most popular) image
          onCityImageChange(data.images[0].url);
        } else if (data.image && data.image.url) {
          // Fallback to single image
          onCityImageChange(data.image.url);
        } else if (data.error) {
          console.log("API returned error:", data.error);
          setError(data.message || data.error);
        } else {
          console.log("No image data received from API:", data);
          setError("Failed to get image data");
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log(`Image API returned status: ${response.status}`, errorData);
        setError(errorData.message || `Image API error: ${response.status}`);
      }
    } catch (error) {
      console.log("Failed to fetch city image:", error);
      setError("Failed to fetch city image");
    } finally {
      setIsLoadingImage(false);
    }
  };

  // Expose refresh method for parent component
  const refreshCityImage = () => {
    if (selectedCity) {
      // Always refresh with popular images to get new options
      fetchCityImage(selectedCity, 'popular');
    }
  };

  // Expose the refresh method to parent
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).refreshCityImage = refreshCityImage;
    }
  }, [selectedCity]);

  const handleCitySelect = (city: City) => {
    console.log("City selected:", city);
    onCitySelect(city);
    setQuery(city.name);
    setShowSuggestions(false);
    setSuggestions([]);
    setError(null); // Clear any previous errors
    
    // Fetch city image automatically (start with most popular)
    fetchCityImage(city, 'popular');
  };

  const handleClear = () => {
    onCitySelect(null);
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Only clear city if user manually clears the input
    if (!value && selectedCity) {
      onCitySelect(null);
      setSuggestions([]);
      setShowSuggestions(false);
    }
    
    // Show suggestions if there's a query and we have suggestions
    if (value && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className={`relative ${className}`} data-city-picker>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors"
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
        />
        
      </div>

             {/* Error Message */}
       {error && (
         <p className="mt-1 text-xs text-red-400">{error}</p>
       )}

       {/* Image Options Selection */}
       {showImageOptions && imageOptions.length > 0 && (
         <div className="mt-3 p-3 bg-white/10 backdrop-blur rounded-lg border border-white/20">
           <h4 className="text-sm font-medium text-white mb-2">Choose your favorite curated travel image:</h4>
           <div className="grid grid-cols-3 gap-2">
             {imageOptions.map((image, index) => (
               <button
                 key={index}
                 onClick={() => {
                   if (onCityImageChange) {
                     onCityImageChange(image.url);
                   }
                   setShowImageOptions(false);
                 }}
                 className="relative group overflow-hidden rounded-lg border-2 border-transparent hover:border-white/40 transition-all"
                 title={`${image.alt} by ${image.photographer}`}
               >
                 <img
                   src={image.url}
                   alt={image.alt}
                   className="w-full h-16 object-cover"
                 />
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                   <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs text-center">
                     <div className="font-medium">Select</div>
                     <div className="text-xs opacity-75">by {image.photographer}</div>
                   </div>
                 </div>
               </button>
             ))}
           </div>
           <div className="mt-2 text-xs text-white/60 text-center">
             Click any image to select it for your plan
           </div>
         </div>
       )}

       {/* Suggestions Dropdown */}
       {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-black/90 backdrop-blur border border-white/20 rounded-md shadow-xl max-h-60 overflow-auto"
        >
          {isLoading && (
            <div className="px-3 py-2 text-white/60 text-sm">
              Searching...
            </div>
          )}
          
          {suggestions.map((city) => (
            <button
              key={city.id}
              onClick={() => handleCitySelect(city)}
              className="w-full px-3 py-2 text-left text-white hover:bg-white/10 transition-colors flex items-center space-x-2"
            >
              <MapPin className="h-4 w-4 text-white/60 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{city.name}</div>
                {city.state && city.country && (
                  <div className="text-xs text-white/60 truncate">
                    {city.state}, {city.country}
                  </div>
                )}
                {!city.state && city.country && (
                  <div className="text-xs text-white/60 truncate">
                    {city.country}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
