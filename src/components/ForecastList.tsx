import { WeatherData, getWeatherIcon } from '../services/weatherService';

interface ForecastListProps {
  weather: WeatherData;
}

export const ForecastList = ({ weather }: ForecastListProps) => {
  const currentHour = new Date().getHours();
  const hourlyData = Array.from({ length: 24 }).map((_, i) => {
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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
      
      {/* Hourly Forecast */}
      <div className="neo-card neo-white" style={{ overflowX: 'auto' }}>
        <h2 style={{ marginBottom: '24px', textTransform: 'uppercase', borderBottom: '4px solid #0f172a', paddingBottom: '8px' }}>Hourly</h2>
        <div style={{ display: 'flex', gap: '16px', minWidth: 'min-content', paddingBottom: '8px' }}>
          {hourlyData.slice(0, 12).map((hour, i) => (
            <div key={i} className="neo-card neo-blue" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px', padding: '12px' }}>
              <span style={{ fontSize: '0.9rem', marginBottom: '8px', fontWeight: 700 }}>{hour.time}</span>
              <span className="material-symbols-rounded" style={{ marginBottom: '8px', fontSize: '32px' }}>
                {getWeatherIcon(hour.code)}
              </span>
              <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>{Math.round(hour.temp)}°</span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Forecast */}
      <div className="neo-card neo-pink">
        <h2 style={{ marginBottom: '24px', textTransform: 'uppercase', borderBottom: '4px solid #0f172a', paddingBottom: '8px' }}>Next 7 Days</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {dailyData.map((day, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '8px' }}>
              <span style={{ width: '100px', fontWeight: 700, fontSize: '1.1rem' }}>{i === 0 ? 'TODAY' : day.date.toUpperCase()}</span>
              <span className="material-symbols-rounded icon-medium">
                {getWeatherIcon(day.code)}
              </span>
              <div style={{ display: 'flex', gap: '16px', minWidth: '90px', justifyContent: 'flex-end', fontWeight: 800, fontSize: '1.2rem' }}>
                <span style={{ color: '#0f172a', opacity: 0.7 }}>{Math.round(day.minTemp)}°</span>
                <span>{Math.round(day.maxTemp)}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
};
