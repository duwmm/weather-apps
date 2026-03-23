import { WeatherData, getWeatherIcon, getWeatherDescription } from '../services/weatherService';

interface CurrentWeatherProps {
  weather: WeatherData['current'];
  locationName: string;
  onSave?: () => void;
  isSaved?: boolean;
}

export const CurrentWeather = ({ weather, locationName, onSave, isSaved }: CurrentWeatherProps) => {
  const icon = getWeatherIcon(weather.weathercode, weather.is_day);
  const description = getWeatherDescription(weather.weathercode);

  return (
    <div className="neo-card neo-yellow" style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '2.5rem', textTransform: 'uppercase', borderBottom: '4px solid #0f172a', display: 'inline-block' }}>
              {locationName}
            </h2>
            {onSave && (
              <button className="neo-button" onClick={onSave} style={{ backgroundColor: isSaved ? 'var(--neo-color-pink)' : 'var(--neo-color-white)' }}>
                <span className="material-symbols-rounded">{isSaved ? 'bookmark' : 'bookmark_border'}</span>
                {isSaved ? 'Saved' : 'Save'}
              </button>
            )}
          </div>
          <p style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: '24px', textTransform: 'uppercase' }}>{description}</p>
          <h1 style={{ fontSize: '6rem' }}>{Math.round(weather.temperature)}°C</h1>
        </div>
        
        <div style={{ textAlign: 'center', padding: '24px', backgroundColor: 'var(--neo-color-white)', border: 'var(--neo-border)', borderRadius: '8px', boxShadow: '4px 4px 0px #0f172a' }}>
          <span className="material-symbols-rounded icon-large" style={{ fontSize: '96px' }}>
            {icon}
          </span>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '24px', marginTop: '32px', flexWrap: 'wrap' }}>
        <div className="neo-card neo-blue" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', flex: '1', minWidth: '200px' }}>
          <span className="material-symbols-rounded icon-medium">air</span>
          <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>Wind: {weather.windspeed} km/h</span>
        </div>
        <div className="neo-card neo-green" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', flex: '1', minWidth: '200px' }}>
          <span className="material-symbols-rounded icon-medium">water_drop</span>
          <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>Humidity: {weather.humidity}%</span>
        </div>
      </div>
    </div>
  );
};
