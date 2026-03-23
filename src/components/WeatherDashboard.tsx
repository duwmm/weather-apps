import { useState, useEffect } from 'react';
import { fetchWeatherData, WeatherData } from '../services/weatherService';
import { CurrentWeather } from './CurrentWeather';
import { ForecastList } from './ForecastList';

interface SearchResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

interface SavedLocation {
  id: string; // lat,lon
  name: string;
  lat: number;
  lon: number;
}

export const WeatherDashboard = () => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [activeLocation, setActiveLocation] = useState<SavedLocation | null>(null);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load saved locations on mount
  useEffect(() => {
    const saved = localStorage.getItem('neoWeatherLocations');
    if (saved) {
      setSavedLocations(JSON.parse(saved));
    }
  }, []);

  // Save locations to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('neoWeatherLocations', JSON.stringify(savedLocations));
  }, [savedLocations]);

  // Initial location fetch
  useEffect(() => {
    if (activeLocation === null && savedLocations.length === 0) {
      if (!navigator.geolocation) {
        setError('Geolocation not supported. Please search for a city.');
        setLoading(false);
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          let name = 'Current Location';
          try {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const geoData = await geoRes.json();
            name = geoData.address.city || geoData.address.town || geoData.address.village || 'Your Location';
          } catch (e) {}
          
          const loc = { id: `${latitude},${longitude}`, name, lat: latitude, lon: longitude };
          setActiveLocation(loc);
          fetchWeather(loc);
        },
        () => {
          setError('Location access denied. Please search for a city.');
          setLoading(false);
        }
      );
    } else if (savedLocations.length > 0 && activeLocation === null) {
      // If we have saved locations and none is active, load the first one
      setActiveLocation(savedLocations[0]);
      fetchWeather(savedLocations[0]);
    }
  }, [savedLocations]);

  const fetchWeather = async (loc: SavedLocation) => {
    setLoading(true);
    setError(null);
    try {
      const weather = await fetchWeatherData(loc.lat, loc.lon);
      setData(weather);
      setActiveLocation(loc);
    } catch (err) {
      setError('Failed to fetch weather data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=5`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.error('Search error', err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (result: SearchResult) => {
    setSearchQuery('');
    setSearchResults([]);
    const displayName = `${result.name}${result.country ? `, ${result.country}` : ''}`;
    const loc = { id: `${result.latitude},${result.longitude}`, name: displayName, lat: result.latitude, lon: result.longitude };
    fetchWeather(loc);
  };

  const toggleSaveLocation = () => {
    if (!activeLocation) return;
    
    const isSaved = savedLocations.some(l => l.id === activeLocation.id);
    if (isSaved) {
      // Remove it
      setSavedLocations(savedLocations.filter(l => l.id !== activeLocation.id));
    } else {
      // Save it
      setSavedLocations([...savedLocations, activeLocation]);
    }
  };

  const isCurrentSaved = activeLocation ? savedLocations.some(l => l.id === activeLocation.id) : false;

  return (
    <div>
      <header style={{ marginBottom: '40px', paddingBottom: '24px', borderBottom: '4px solid var(--neo-text)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="material-symbols-rounded icon-medium" style={{ backgroundColor: 'var(--neo-color-yellow)', borderRadius: '50%', padding: '8px', border: 'var(--neo-border)', boxShadow: 'var(--neo-shadow)' }}>
              wb_sunny
            </span>
            <h1>Weather</h1>
          </div>

          <div style={{ position: 'relative', width: '100%', maxWidth: '400px', zIndex: 10 }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', position: 'relative' }}>
              <span className="material-symbols-rounded" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800 }}>
                search
              </span>
              <input 
                type="text" 
                className="search-input"
                placeholder={isSearching ? "Searching..." : "Search global cities..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((res) => (
                  <div key={res.id} className="search-result-item" onClick={() => selectSearchResult(res)}>
                    <div>{res.name}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 400 }}>
                      {res.admin1 ? `${res.admin1}, ` : ''}{res.country}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Saved Locations Tabs */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', textTransform: 'uppercase' }}>My Locations:</h3>
          {savedLocations.length === 0 && <span style={{ opacity: 0.6, fontStyle: 'italic' }}>None saved yet</span>}
          {savedLocations.map(loc => (
            <button 
              key={loc.id} 
              className={`neo-button ${activeLocation?.id === loc.id ? 'active-tab' : ''}`}
              onClick={() => fetchWeather(loc)}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '1.2rem' }}>location_on</span>
              {loc.name.split(',')[0]}
            </button>
          ))}
        </div>
      </header>

      <main>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
            <div className="neo-card neo-yellow" style={{ animation: 'pulse 1s infinite alternate' }}>
              <h2>Loading Weather...</h2>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="neo-card neo-pink">
            <h2>ERROR</h2>
            <p style={{ marginTop: '16px', fontSize: '1.2rem', fontWeight: 600 }}>{error}</p>
          </div>
        )}

        {!loading && data && activeLocation && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <CurrentWeather 
              weather={data.current} 
              locationName={activeLocation.name} 
              onSave={toggleSaveLocation}
              isSaved={isCurrentSaved}
            />
            <ForecastList weather={data} />
          </div>
        )}
      </main>
      
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            from { opacity: 0.7; transform: scale(0.98); }
            to { opacity: 1; transform: scale(1.02); }
          }
        `}
      </style>
    </div>
  );
};
