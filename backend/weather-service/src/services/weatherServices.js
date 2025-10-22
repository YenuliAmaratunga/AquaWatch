// External API calls (OpenWeatherMap, Open Meteo)
import axios from "axios";

// Fetch current weather data (OpenWeather)
export const fetchWeatherData = async (lat, lon) => {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    const response = await axios.get(url);
    return {
      source: "OpenWeather",
      location: response.data.name,
      temperature: response.data.main.temp,
      windSpeed: response.data.wind.speed,
      conditions: response.data.weather[0].description,
    };
  } catch (err) {
    console.error("OpenWeather API error:", err.message);
    return { source: "OpenWeather", error: err.message };
  }
};

// Fetch marine weather from Open-Meteo
export const fetchMarineWeatherData = async (lat, lon) => {
  try {
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&daily=wave_height_max,wave_direction_dominant,wind_wave_height_max,wind_wave_direction_dominant&hourly=wave_height,wave_direction,wave_period,ocean_current_velocity,ocean_current_direction&current=wave_height,wave_direction,wave_period,swell_wave_direction,ocean_current_velocity,sea_surface_temperature,sea_level_height_msl`;

    const response = await axios.get(url);

    return {
      source: "OpenMeteoMarine",
      current: response.data.current,
      hourly: response.data.hourly,
      daily: response.data.daily,
    };
  } catch (err) {
    console.error("OpenMeteo Marine API error:", err.message);
    return { source: "OpenMeteoMarine", error: err.message };
  }
};


