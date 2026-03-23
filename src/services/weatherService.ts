export interface WeatherData {
  current: {
    temperature: number;
    weathercode: number;
    is_day: number;
    windspeed: number;
    humidity: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weathercode: number[];
  };
  daily: {
    time: string[];
    weathercode: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

export const fetchWeatherData = async (lat: number, lon: number): Promise<WeatherData> => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch weather data');
  
  const data = await response.json();
  
  return {
    current: {
      temperature: data.current.temperature_2m,
      weathercode: data.current.weather_code,
      is_day: data.current.is_day,
      windspeed: data.current.wind_speed_10m,
      humidity: data.current.relative_humidity_2m
    },
    hourly: {
      time: data.hourly.time,
      temperature_2m: data.hourly.temperature_2m,
      weathercode: data.hourly.weather_code
    },
    daily: {
      time: data.daily.time,
      weathercode: data.daily.weather_code,
      temperature_2m_max: data.daily.temperature_2m_max,
      temperature_2m_min: data.daily.temperature_2m_min
    }
  };
};

export const getWeatherIcon = (code: number, isDay: number = 1): string => {
  // WMO weather interpretation codes
  // https://open-meteo.com/en/docs
  if (code === 0) return isDay ? 'clear_day' : 'clear_night';
  if ([1, 2, 3].includes(code)) return 'partly_cloudy_day';
  if ([45, 48].includes(code)) return 'foggy';
  if ([51, 53, 55, 56, 57].includes(code)) return 'rainy_light'; // drizzle
  if ([61, 63, 65, 66, 67].includes(code)) return 'rainy';
  if ([71, 73, 75, 77].includes(code)) return 'snowing';
  if ([80, 81, 82].includes(code)) return 'rainy'; // showers
  if ([85, 86].includes(code)) return 'snowing'; // snow showers
  if ([95, 96, 99].includes(code)) return 'thunderstorm';
  return 'cloud';
};

export const getWeatherDescription = (code: number): string => {
  if (code === 0) return 'Clear sky';
  if (code === 1) return 'Mainly clear';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if ([45, 48].includes(code)) return 'Fog';
  if ([51, 53, 55].includes(code)) return 'Drizzle';
  if ([56, 57].includes(code)) return 'Freezing Drizzle';
  if ([61, 63, 65].includes(code)) return 'Rain';
  if ([66, 67].includes(code)) return 'Freezing Rain';
  if ([71, 73, 75].includes(code)) return 'Snow fall';
  if (code === 77) return 'Snow grains';
  if ([80, 81, 82].includes(code)) return 'Rain showers';
  if ([85, 86].includes(code)) return 'Snow showers';
  if (code === 95) return 'Thunderstorm';
  if ([96, 99].includes(code)) return 'Thunderstorm with hail';
  return 'Unknown';
}
