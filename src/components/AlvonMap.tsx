import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, Navigation, Search, RefreshCw, Star, Phone, Clock, Compass, 
  Map as MapIcon, ChevronRight, Check, AlertCircle, Sparkles, Locate, Info, X
} from 'lucide-react';
import { GlassCard } from './GlassCard';

// Extracted mock list of premium India-centric local service points & CSC (Common Services Centers)
interface Place {
  id: string;
  name: string;
  type: 'csc' | 'shop' | 'pharmacy' | 'alvon_store' | 'atm';
  typeName: string;
  lat: number;
  lng: number;
  rating: number;
  reviewsCount: number;
  phone: string;
  hours: string;
  address: string;
  landmark: string;
  speciality?: string;
  distance?: number; // calculated dynamically in km
}

const PRESET_PLACES: Place[] = [
  // Delhi NCR
  {
    id: 'csc_delhi_1',
    name: 'CSC Digital Seva Kendra - Connaught Place',
    type: 'csc',
    typeName: 'CSC Center',
    lat: 28.6304,
    lng: 77.2177,
    rating: 4.8,
    reviewsCount: 145,
    phone: '+91 98765 43210',
    hours: '09:30 AM - 06:30 PM (Sun Closed)',
    address: 'Shop No. 12, Block E, Connaught Place, New Delhi',
    landmark: 'Near CP Metro Station Gate 4',
    speciality: 'Aadhaar Update, PAN Card, G2C Services, Ayushman Card'
  },
  {
    id: 'csc_delhi_2',
    name: 'Jan Seva CSC Center - Karol Bagh',
    type: 'csc',
    typeName: 'CSC Center',
    lat: 28.6435,
    lng: 77.1895,
    rating: 4.6,
    reviewsCount: 92,
    phone: '+91 99887 76655',
    hours: '10:00 AM - 07:00 PM',
    address: 'Plot 45, Ground Floor, Arya Samaj Road, Karol Bagh, Delhi',
    landmark: 'Opposite Karol Bagh Metro Pillar 110',
    speciality: 'Income Certificate, Ration Card, Passport Registration'
  },
  {
    id: 'jan_aushadhi_1',
    name: 'Pradhan Mantri Bhartiya Jan Aushadhi Kendra',
    type: 'pharmacy',
    typeName: 'Jan Aushadhi',
    lat: 28.6212,
    lng: 77.2084,
    rating: 4.9,
    reviewsCount: 310,
    phone: '+91 11 2345 6789',
    hours: '08:00 AM - 10:00 PM (Daily)',
    address: 'Shop 2, Mandir Marg, Sector 4, Gole Market, New Delhi',
    landmark: 'Next to Birla Mandir outer gate',
    speciality: 'Government Subsidized Quality Generic Medicines'
  },
  {
    id: 'alvon_hub_delhi',
    name: 'Alvon Super Store & Smart Pick-up Point',
    type: 'alvon_store',
    typeName: 'Alvon Hub',
    lat: 28.6280,
    lng: 77.2210,
    rating: 4.9,
    reviewsCount: 420,
    phone: '+91 80000 12345',
    hours: '09:00 AM - 09:30 PM',
    address: 'Underground Level 1, Rajiv Chowk Metro Interchange, New Delhi',
    landmark: 'Near Gate 1 Escalator link',
    speciality: 'Instant Super Pickups, Free eSIM Setup, Alvon Pay Cash-In'
  },
  {
    id: 'sbi_atm_cp',
    name: 'State Bank of India (SBI) Cash Point',
    type: 'atm',
    typeName: 'ATM',
    lat: 28.6322,
    lng: 77.2198,
    rating: 4.2,
    reviewsCount: 58,
    phone: '1800 1234 (Toll-Free)',
    hours: '24 Hours Open',
    address: 'F-14, Inner Circle, Connaught Place, New Delhi',
    landmark: 'Adjacent to Indian Coffee House',
    speciality: 'UPI Cashless Withdrawal, Deposit Machine'
  },
  {
    id: 'kirana_delhi_1',
    name: 'Sharma Ji Fresh Grocery & Kirana',
    type: 'shop',
    typeName: 'Kirana Store',
    lat: 28.6355,
    lng: 77.2112,
    rating: 4.7,
    reviewsCount: 188,
    phone: '+91 91112 22333',
    hours: '07:30 AM - 10:00 PM',
    address: 'B-89, Gole Market Road, CP West End, New Delhi',
    landmark: 'Opposite Rama Krishna Mission Ashram',
    speciality: 'Authorized Alvon Mart Delivery Point, Organic Grains'
  },

  // Mumbai
  {
    id: 'csc_mumbai_1',
    name: 'Mahaonline CSC Seva Center - Dadar',
    type: 'csc',
    typeName: 'CSC Center',
    lat: 19.0178,
    lng: 72.8478,
    rating: 4.7,
    reviewsCount: 112,
    phone: '+91 95555 44433',
    hours: '10:00 AM - 06:30 PM (Sun Closed)',
    address: 'Rustom Building, NC Kelkar Road, Dadar West, Mumbai',
    landmark: 'Near Plaza Cinema',
    speciality: 'Domicile Certificate, Cast Validation, State G2C Services'
  },
  {
    id: 'alvon_hub_mumbai',
    name: 'Alvon Smart Hub & Experiential Zone',
    type: 'alvon_store',
    typeName: 'Alvon Hub',
    lat: 19.0195,
    lng: 72.8435,
    rating: 4.9,
    reviewsCount: 380,
    phone: '+91 80000 54321',
    hours: '10:00 AM - 10:00 PM',
    address: 'Block B, Star Mall, NC Kelkar Road, Dadar West, Mumbai',
    landmark: 'Opposite Shivaji Park Ground Entrance',
    speciality: 'Aatmanirbhar Tech Support, eSIM, Alvon Mart Pickup'
  },
  {
    id: 'jan_aushadhi_mumbai',
    name: 'PM Jan Aushadhi Store - Fort',
    type: 'pharmacy',
    typeName: 'Jan Aushadhi',
    lat: 18.9345,
    lng: 72.8364,
    rating: 4.8,
    reviewsCount: 220,
    phone: '+91 22 2266 1122',
    hours: '08:30 AM - 09:30 PM',
    address: 'Shop 15, Military Square Lane, Near Kalaghoda, Fort, Mumbai',
    landmark: 'Behind Jehangir Art Gallery',
    speciality: 'Affordable Essential Drugs, Surgical Disposables'
  }
];

export const AlvonMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapInstanceRef = useRef<any | null>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const routePolylineRef = useRef<any | null>(null);

  // Map & Location states
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 28.6304, lng: 77.2177 }); // Default CP Delhi
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(PRESET_PLACES[0]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
    steps: string[];
  } | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [locating, setLocating] = useState(false);

  // Dynamic Leaflet CSS and JS Injection
  useEffect(() => {
    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    // Check if scripts/css are already appended
    let cssLink = document.getElementById('leaflet-css') as HTMLLinkElement;
    if (!cssLink) {
      cssLink = document.createElement('link');
      cssLink.id = 'leaflet-css';
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(cssLink);
    }

    let jsScript = document.getElementById('leaflet-js') as HTMLScriptElement;
    if (!jsScript) {
      jsScript = document.createElement('script');
      jsScript.id = 'leaflet-js';
      jsScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      jsScript.async = true;
      jsScript.onload = () => {
        setLeafletLoaded(true);
      };
      document.head.appendChild(jsScript);
    } else {
      // Script is present but maybe not loaded yet, poll briefly
      const interval = setInterval(() => {
        if ((window as any).L) {
          setLeafletLoaded(true);
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  // Calculate Haversine distance
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  };

  // HTML5 Geolocate User
  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coords = { lat: latitude, lng: longitude };
        setUserCoords(coords);
        setMapCenter(coords);
        
        if (leafletMapInstanceRef.current) {
          leafletMapInstanceRef.current.setView([latitude, longitude], 14);
          
          // Draw or update Pulsing User Marker
          const L = (window as any).L;
          if (markersRef.current['user']) {
            markersRef.current['user'].setLatLng([latitude, longitude]);
          } else {
            const pulsingIcon = L.divIcon({
              className: 'relative flex items-center justify-center',
              html: `
                <span class="absolute inline-flex h-6 w-6 animate-ping rounded-full bg-rose-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-rose-600 border border-white"></span>
              `,
              iconSize: [24, 24]
            });
            markersRef.current['user'] = L.marker([latitude, longitude], { icon: pulsingIcon })
              .addTo(leafletMapInstanceRef.current)
              .bindPopup('<b>Your Current Location</b>')
              .openPopup();
          }
        }
        setLocating(false);
      },
      (error) => {
        console.error('Error finding location:', error);
        alert('Could not retrieve your precise location. Defaulting to Connaught Place, New Delhi.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  // Initialize and Render Leaflet Map
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current) return;

    const L = (window as any).L;
    
    // Clear existing map instance if it exists to support hot reloading / re-renders
    if (leafletMapInstanceRef.current) {
      leafletMapInstanceRef.current.remove();
      leafletMapInstanceRef.current = null;
      markersRef.current = {};
    }

    // Initialize Map Instance
    const map = L.map(mapRef.current, {
      zoomControl: false, // Custom position Zoom Control below
      attributionControl: false // Made simple
    }).setView([mapCenter.lat, mapCenter.lng], 13);

    leafletMapInstanceRef.current = map;

    // Load custom tile layer (Classic OpenStreetMap or High Contrast Stadia depending on looks)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Append custom lightweight scale indicator
    L.control.scale({ position: 'bottomright' }).addTo(map);

    // Initial Geolocation trigger to find user's true position
    setTimeout(() => {
      handleGeolocate();
    }, 1000);

    return () => {
      if (leafletMapInstanceRef.current) {
        leafletMapInstanceRef.current.remove();
        leafletMapInstanceRef.current = null;
        markersRef.current = {};
      }
    };
  }, [leafletLoaded]);

  // Handle Markers addition and styling based on filter
  useEffect(() => {
    if (!leafletLoaded || !leafletMapInstanceRef.current) return;

    const L = (window as any).L;
    const map = leafletMapInstanceRef.current;

    // Clear old non-user markers
    Object.keys(markersRef.current).forEach((key) => {
      if (key !== 'user') {
        markersRef.current[key].remove();
        delete markersRef.current[key];
      }
    });

    // Draw active places markers
    const filteredPlaces = PRESET_PLACES.filter(p => selectedType === 'all' || p.type === selectedType);
    
    filteredPlaces.forEach((place) => {
      const getMarkerColor = (type: string) => {
        if (type === 'csc') return '#e11d48'; // Rose
        if (type === 'pharmacy') return '#059669'; // Emerald green
        if (type === 'alvon_store') return '#4f46e5'; // Indigo
        if (type === 'atm') return '#2563eb'; // Blue
        return '#ea580c'; // Orange
      };

      const getMarkerIconChar = (type: string) => {
        if (type === 'csc') return '🖥️';
        if (type === 'pharmacy') return '💊';
        if (type === 'alvon_store') return '⭐';
        if (type === 'atm') return '💵';
        return '🛒';
      };

      const customPin = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div class="relative flex flex-col items-center">
            <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm shadow-xl border-2 border-white transition-transform hover:scale-115 cursor-pointer" style="background-color: ${getMarkerColor(place.type)}">
              ${getMarkerIconChar(place.type)}
            </div>
            <div class="w-2.5 h-2.5 -mt-1.5 rotate-45 shadow-sm border-r border-b border-white" style="background-color: ${getMarkerColor(place.type)}"></div>
          </div>
        `,
        iconSize: [36, 42],
        iconAnchor: [18, 42]
      });

      const marker = L.marker([place.lat, place.lng], { icon: customPin }).addTo(map);
      
      marker.on('click', () => {
        setSelectedPlace(place);
        map.setView([place.lat, place.lng], 14, { animate: true });
      });

      markersRef.current[place.id] = marker;
    });

    // If selected place is part of filtered list, center and open popup
    if (selectedPlace && filteredPlaces.some(p => p.id === selectedPlace.id)) {
      map.setView([selectedPlace.lat, selectedPlace.lng], 14);
    }

  }, [leafletLoaded, selectedType, selectedPlace]);

  // Interactive routing computation
  const handleCalculateRoute = (place: Place) => {
    if (!leafletLoaded || !leafletMapInstanceRef.current) return;
    
    const L = (window as any).L;
    const map = leafletMapInstanceRef.current;

    // Clear old route line
    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    const startLat = userCoords ? userCoords.lat : 28.6250; // default near Connaught Place
    const startLng = userCoords ? userCoords.lng : 77.2100;

    // Mock realistic routing path coords with slight noise/turn curves to look extremely professional
    const midpointLat = (startLat + place.lat) / 2;
    const midpointLng = (startLng + place.lng) / 2;

    const detour1Lat = midpointLat + (place.lat - startLat) * 0.15 + 0.002;
    const detour1Lng = midpointLng - (place.lng - startLng) * 0.15;
    const detour2Lat = midpointLat - (place.lat - startLat) * 0.15;
    const detour2Lng = midpointLng + (place.lng - startLng) * 0.15 + 0.001;

    const routeCoordinates = [
      [startLat, startLng],
      [startLat + (detour1Lat - startLat) * 0.5, startLng + (detour1Lng - startLng) * 0.5],
      [detour1Lat, detour1Lng],
      [detour2Lat, detour2Lng],
      [place.lat, place.lng]
    ];

    // Draw Route Polyline with a beautiful glowing Rose accent
    const polyline = L.polyline(routeCoordinates, {
      color: '#e11d48',
      weight: 5,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round',
      dashArray: isNavigating ? '10, 10' : 'none'
    }).addTo(map);

    routePolylineRef.current = polyline;

    // Fit map bounds to show route
    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

    // Compute realistic mock navigation details
    const distanceKm = getDistance(startLat, startLng, place.lat, place.lng);
    const speedKmh = 25; // moderate city traffic speed in India
    const durationMins = Math.ceil((distanceKm / speedKmh) * 60) + 2; // offset for signals

    const cscCenterSpecialText = place.type === 'csc' ? 'Avoid lunch hours between 1:30 PM - 2:15 PM.' : '';

    setRouteInfo({
      distance: `${distanceKm} km`,
      duration: `${durationMins} mins`,
      steps: [
        'Head north-west from your current location towards Main Arterial Road',
        `Turn left onto Mahatma Gandhi Bypass and pass the prominent Hanuman Mandir on your right (1.2 km)`,
        `At the roundabout, take the 3rd exit and follow signs for ${place.landmark} (800 meters)`,
        `In 400 meters, turn sharp left into the local market corridor near CP Circle.`,
        `Your destination (${place.name}) is on your left, next to the Cash point. ${cscCenterSpecialText}`
      ]
    });
    setIsNavigating(true);
  };

  // Exit Navigation Routing view
  const handleStopNavigation = () => {
    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }
    setRouteInfo(null);
    setIsNavigating(false);
  };

  // Zoom helpers
  const handleZoomIn = () => {
    if (leafletMapInstanceRef.current) {
      leafletMapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (leafletMapInstanceRef.current) {
      leafletMapInstanceRef.current.zoomOut();
    }
  };

  // Filter list by Search Bar
  const searchFilteredPlaces = PRESET_PLACES.filter(place => {
    const query = searchQuery.toLowerCase();
    return (
      place.name.toLowerCase().includes(query) ||
      place.address.toLowerCase().includes(query) ||
      place.speciality?.toLowerCase().includes(query) ||
      place.typeName.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6" id="alvon-maps-section">
      
      {/* Search and Quick Filters Banner */}
      <GlassCard className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-rose-950 text-white border-none flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <span className="inline-block bg-rose-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
            ALVON DIGITAL INDIA
          </span>
          <h2 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center justify-center md:justify-start space-x-2">
            <span>🗺️</span>
            <span>Alvon Map & Local CSC Finder</span>
          </h2>
          <p className="text-xs text-slate-300 max-w-xl font-medium">
            Locate authorized government CSC Seva Kendras, Pradhan Mantri Jan Aushadhi generic pharmacies, local retail stores, and ATMs. Get real-time path routing & Indian street navigation guidance.
          </p>
        </div>

        {/* Dynamic Search Container */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search CSC centers, pharmacies, shops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 text-xs font-bold bg-white/10 backdrop-blur-md text-white border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/50 placeholder-slate-400"
          />
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </GlassCard>

      {/* Main Interactive Map Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Search Results & Categories Drawer */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Quick Category Buttons */}
          <GlassCard className="p-3">
            <h3 className="text-xs font-extrabold text-slate-400 font-mono tracking-wider uppercase mb-2">
              Browse Locations by Category
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'All', icon: '📍' },
                { id: 'csc', label: 'CSC Centers', icon: '🖥️' },
                { id: 'pharmacy', label: 'Jan Aushadhi', icon: '💊' },
                { id: 'alvon_store', label: 'Alvon Hubs', icon: '⭐' },
                { id: 'atm', label: 'ATMs', icon: '💵' },
                { id: 'shop', label: 'Kirana Stores', icon: '🛒' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedType(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-black tracking-tight flex items-center space-x-1 transition-all cursor-pointer border ${
                    selectedType === cat.id
                      ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/10'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-100'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Places List Container */}
          <GlassCard className="p-0 overflow-hidden flex flex-col max-h-[460px] border-slate-100">
            <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 font-mono uppercase">
                Location Catalog ({searchFilteredPlaces.length})
              </span>
              <button 
                onClick={handleGeolocate}
                className="text-[10px] font-black text-rose-600 hover:text-rose-700 flex items-center space-x-1 cursor-pointer"
              >
                <Locate className="w-3.5 h-3.5 animate-pulse" />
                <span>Sync Geolocation</span>
              </button>
            </div>

            <div className="overflow-y-auto divide-y divide-slate-100">
              {searchFilteredPlaces.map((place) => {
                const isSelected = selectedPlace?.id === place.id;
                
                // Calculate dynamic distance to display if userCoords exist
                const distance = userCoords 
                  ? getDistance(userCoords.lat, userCoords.lng, place.lat, place.lng)
                  : null;

                return (
                  <button
                    key={place.id}
                    onClick={() => {
                      setSelectedPlace(place);
                      if (leafletMapInstanceRef.current) {
                        leafletMapInstanceRef.current.setView([place.lat, place.lng], 14, { animate: true });
                      }
                    }}
                    className={`w-full p-3.5 text-left transition-all flex items-start space-x-3 cursor-pointer ${
                      isSelected 
                        ? 'bg-rose-50/70 border-l-4 border-l-rose-600' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-2 rounded-xl text-lg shrink-0 mt-0.5 ${
                      place.type === 'csc' ? 'bg-rose-100 text-rose-700' :
                      place.type === 'pharmacy' ? 'bg-emerald-100 text-emerald-700' :
                      place.type === 'alvon_store' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {place.type === 'csc' ? '🖥️' : place.type === 'pharmacy' ? '💊' : place.type === 'alvon_store' ? '⭐' : '🛒'}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-extrabold text-slate-400 font-mono tracking-wider uppercase">
                          {place.typeName}
                        </span>
                        {distance !== null && (
                          <span className="text-[9px] bg-rose-50 text-rose-600 font-black px-1.5 py-0.2 rounded font-mono">
                            {distance} km away
                          </span>
                        )}
                      </div>
                      
                      <h4 className="text-xs font-black text-slate-800 truncate">
                        {place.name}
                      </h4>
                      
                      <p className="text-[10px] text-slate-500 font-medium truncate">
                        📍 {place.landmark}
                      </p>

                      <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400">
                        <span className="flex items-center text-amber-500">
                          ★ <span className="ml-0.5 text-slate-700">{place.rating}</span>
                        </span>
                        <span>•</span>
                        <span>{place.reviewsCount} reviews</span>
                      </div>
                    </div>
                  </button>
                );
              })}

              {searchFilteredPlaces.length === 0 && (
                <div className="p-8 text-center text-slate-400 font-mono text-xs font-bold leading-normal">
                  No registered centers or local services found in this region. Try searching for "CSC", "Pharmacy", or "SBI".
                </div>
              )}
            </div>
          </GlassCard>

        </div>

        {/* Right Side: Interactive Leaflet Map & Selected Place Details Pane */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Map canvas container */}
          <GlassCard className="p-0 border-none shadow-xl overflow-hidden relative h-[380px] lg:h-[420px] rounded-2xl">
            
            {/* Real Leaflet Map Render Anchor */}
            <div 
              ref={mapRef} 
              className="w-full h-full z-0" 
              style={{ minHeight: '380px' }}
            />

            {/* Custom overlay floating Map Controls */}
            <div className="absolute right-4 bottom-4 flex flex-col space-y-2 z-[999]">
              <button 
                onClick={handleZoomIn}
                className="w-9 h-9 bg-white hover:bg-slate-50 text-slate-800 rounded-lg shadow-lg flex items-center justify-center font-black text-lg transition-all border border-slate-100 cursor-pointer"
                title="Zoom In"
              >
                +
              </button>
              <button 
                onClick={handleZoomOut}
                className="w-9 h-9 bg-white hover:bg-slate-50 text-slate-800 rounded-lg shadow-lg flex items-center justify-center font-black text-lg transition-all border border-slate-100 cursor-pointer"
                title="Zoom Out"
              >
                −
              </button>
              <button 
                onClick={handleGeolocate}
                disabled={locating}
                className="w-9 h-9 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-lg flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
                title="Find My Location"
              >
                {locating ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : <Locate className="w-4.5 h-4.5" />}
              </button>
            </div>

            {/* Simulated Live Location Info Banner */}
            <div className="absolute left-4 top-4 bg-slate-900/95 backdrop-blur-md text-white border border-slate-800 p-2.5 rounded-xl z-[999] shadow-2xl flex items-center space-x-3 max-w-xs md:max-w-md">
              <div className="p-1.5 bg-rose-600 rounded-lg text-white">
                <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div className="min-w-0">
                <span className="text-[8px] text-rose-500 font-extrabold font-mono uppercase block">LIVE INDIA TRACKER</span>
                <p className="text-[10px] text-slate-300 font-black truncate">
                  {userCoords 
                    ? `Tracking Live Lat: ${userCoords.lat.toFixed(4)}, Lng: ${userCoords.lng.toFixed(4)}` 
                    : 'Searching for GPS signals near Connaught Place...'}
                </p>
              </div>
            </div>

            {/* Leaflet Loading Fallback */}
            {!leafletLoaded && (
              <div className="absolute inset-0 bg-slate-100/80 backdrop-blur-sm flex items-center justify-center z-[9999] flex-col space-y-2">
                <RefreshCw className="w-8 h-8 text-rose-600 animate-spin" />
                <span className="text-xs font-black text-slate-700 font-mono">LOADING LEAFLET MAPS INTERACTIVE GPS ENGINE...</span>
              </div>
            )}
          </GlassCard>

          {/* Active Navigation Path Instructions Drawer */}
          <AnimatePresence>
            {isNavigating && routeInfo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-rose-600 text-white rounded-xl">
                      <Navigation className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black tracking-tight uppercase font-mono text-rose-500">
                        Active Turn-by-Turn Guidance
                      </h4>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="font-extrabold text-slate-100">{routeInfo.duration}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">{routeInfo.distance}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleStopNavigation}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white rounded-lg text-[10px] font-black transition-all cursor-pointer"
                  >
                    Exit Navigation
                  </button>
                </div>

                {/* Steps detail list */}
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-2">
                  {routeInfo.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start space-x-3 text-xs">
                      <span className="w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-bold text-rose-400 shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-slate-300 leading-relaxed font-medium">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Card Panel: Detailed Metadata for Selected Place */}
          {selectedPlace && !isNavigating && (
            <GlassCard className="p-5 border-slate-100 hover:shadow-lg transition-all space-y-4">
              
              {/* Detailed panel header */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-start space-x-3.5">
                  <div className={`p-3 bg-slate-100 text-2xl rounded-xl shrink-0 ${
                    selectedPlace.type === 'csc' ? 'bg-rose-100' :
                    selectedPlace.type === 'pharmacy' ? 'bg-emerald-100' : 'bg-indigo-100'
                  }`}>
                    {selectedPlace.type === 'csc' ? '🖥️' : selectedPlace.type === 'pharmacy' ? '💊' : '⭐'}
                  </div>
                  <div>
                    <span className="text-[10px] bg-rose-50 text-rose-600 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                      {selectedPlace.typeName}
                    </span>
                    <h3 className="text-base font-black text-slate-800 tracking-tight mt-1">
                      {selectedPlace.name}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => handleCalculateRoute(selectedPlace)}
                  className="w-full md:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-rose-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer shrink-0"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Navigate Directions</span>
                </button>
              </div>

              {/* Information Rows */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Column 1 */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-2.5 text-xs">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold text-slate-700 block">Complete Address</span>
                      <p className="text-slate-500 font-medium">{selectedPlace.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2.5 text-xs">
                    <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold text-slate-700 block">Nearby Landmark</span>
                      <p className="text-slate-500 font-medium">{selectedPlace.landmark}</p>
                    </div>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-2.5 text-xs">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold text-slate-700 block">Contact Phone No</span>
                      <p className="text-slate-500 font-mono font-medium">{selectedPlace.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2.5 text-xs">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold text-slate-700 block">Operational Timings</span>
                      <p className="text-slate-500 font-medium">{selectedPlace.hours}</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Special services / tags badge list */}
              {selectedPlace.speciality && (
                <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl space-y-1">
                  <span className="text-[10px] text-rose-600 font-extrabold font-mono uppercase block tracking-wider">
                    Services Offered & Highlights
                  </span>
                  <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
                    ⚙️ {selectedPlace.speciality}
                  </p>
                </div>
              )}

              {/* Highlight reviews preview */}
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs font-bold text-slate-400">
                <span className="flex items-center text-amber-500 font-black">
                  ★ <span className="ml-1 text-slate-700">{selectedPlace.rating} / 5.0</span>
                  <span className="ml-1.5 text-slate-400 font-medium">({selectedPlace.reviewsCount} users verified on Alvon Network)</span>
                </span>
                
                <span className="text-emerald-600 text-[10px] font-black flex items-center space-x-1 uppercase">
                  <Check className="w-3.5 h-3.5" />
                  <span>Authorized Center</span>
                </span>
              </div>

            </GlassCard>
          )}

        </div>

      </div>

    </div>
  );
};
