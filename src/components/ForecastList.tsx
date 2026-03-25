import { WeatherData, getWeatherIcon, getWeatherColor } from '../services/weatherService';

interface ForecastListProps {
  weather: WeatherData;
}

export const ForecastList = ({ weather }: ForecastListProps) => {
  // Get 12 hours of forecast (makes a nice 3x4 or 4x3 grid)
  const hourlyData = Array.from({ length: 12 }).map((_, i) => {
    return {
      time: new Date(weather.hourly.time[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temp: weather.hourly.temperature_2m[i],
      code: weather.hourly.weathercode[i]
    };
  });

  const dailyData = weather.daily.time.map((time, i) => ({
    date: new Date(time).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
    minTemp: weather.daily.temperature_2m_min[i],
    maxTemp: weather.daily.temperature_2m_max[i],
    code: weather.daily.weathercode[i]
  })).slice(0, 7);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start' }}>
      
      {/* Hourly Forecast - Grid Layout to Fulfill the Square */}
      <div className="neo-card neo-white" style={{ display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ marginBottom: '24px', textTransform: 'uppercase', borderBottom: '4px solid #0f172a', paddingBottom: '8px' }}>Hourly</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '16px', padding: '16px 0' }}>
          {hourlyData.map((hour, i) => (
            <div key={i} className="neo-card hourly-card" style={{ 
              backgroundColor: getWeatherColor(hour.code, 1),
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center', 
              alignItems: 'center', 
              padding: '8px',
              border: '3px solid #0f172a',
              borderRadius: '8px',
              boxShadow: '3px 3px 0px #0f172a'
            }}>
              <div className="time-tag">
                {hour.time.replace(' ', '\n')}
              </div>
              <span className="material-symbols-rounded" style={{ fontSize: '36px', marginBottom: '8px' }}>
                {getWeatherIcon(hour.code)}
              </span>
              <span style={{ fontWeight: 900, fontSize: '1.4rem' }}>{Math.round(hour.temp)}°</span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Forecast */}
      <div className="neo-card neo-white">
        <h2 style={{ marginBottom: '24px', textTransform: 'uppercase', borderBottom: '4px solid #0f172a', paddingBottom: '8px' }}>Next 7 Days</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {dailyData.map((day, i) => (
            <div key={i} className="neo-card" style={{ 
              backgroundColor: getWeatherColor(day.code, 1),
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '16px',
            }}>
              <span style={{ width: '100px', fontWeight: 700, fontSize: '1.1rem' }}>{i === 0 ? 'TODAY' : day.date.toUpperCase()}</span>
              <span className="material-symbols-rounded icon-medium" style={{ fontSize: '32px' }}>
                {getWeatherIcon(day.code)}
              </span>
              <div style={{ display: 'flex', gap: '16px', minWidth: '90px', justifyContent: 'flex-end', fontWeight: 800, fontSize: '1.2rem' }}>
                <span style={{ opacity: 0.7 }}>{Math.round(day.minTemp)}°</span>
                <span>{Math.round(day.maxTemp)}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
};
