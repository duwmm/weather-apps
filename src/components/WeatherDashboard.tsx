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
  id: string;
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

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('neoWeatherLocations');
    if (saved) {
      setSavedLocations(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('neoWeatherLocations', JSON.stringify(savedLocations));
  }, [savedLocations]);

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
          setError('Location access denied. Please search.');
          setLoading(false);
        }
      );
    } else if (savedLocations.length > 0 && activeLocation === null) {
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

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
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
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

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
      setSavedLocations(savedLocations.filter(l => l.id !== activeLocation.id));
    } else {
      setSavedLocations([...savedLocations, activeLocation]);
    }
  };

  const handleDragStart = (idx: number) => setDraggedIdx(idx);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (dropIdx: number) => {
    if (draggedIdx === null || draggedIdx === dropIdx) return;
    const items = [...savedLocations];
    const draggedItem = items[draggedIdx];
    items.splice(draggedIdx, 1);
    items.splice(dropIdx, 0, draggedItem);
    setSavedLocations(items);
    setDraggedIdx(null);
  };

  const isCurrentSaved = activeLocation ? savedLocations.some(l => l.id === activeLocation.id) : false;

  return (
    <div>
      <header style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '4px solid var(--neo-text)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="material-symbols-rounded icon-medium" style={{ backgroundColor: 'var(--neo-color-yellow)', borderRadius: '50%', padding: '8px', border: 'var(--neo-border)', boxShadow: 'var(--neo-shadow)' }}>
              wb_sunny
            </span>
            <h1 style={{ fontSize: '3rem' }}>Weather</h1>
          </div>

          <div style={{ position: 'relative', width: '100%', maxWidth: '400px', zIndex: 10 }}>
            <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', position: 'relative' }}>
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

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', textTransform: 'uppercase', marginRight: '8px' }}>My Locations:</h3>
          {savedLocations.length === 0 && <span style={{ opacity: 0.6, fontStyle: 'italic' }}>None saved yet. Search to add!</span>}
          {savedLocations.map((loc, index) => (
            <button 
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
              key={loc.id} 
              className={`neo-button ${activeLocation?.id === loc.id ? 'active-tab' : ''}`}
              onClick={() => fetchWeather(loc)}
              title="Drag to reorder"
            >
              <span className="material-symbols-rounded" style={{ fontSize: '1.2rem', cursor: 'grab' }}>drag_indicator</span>
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
