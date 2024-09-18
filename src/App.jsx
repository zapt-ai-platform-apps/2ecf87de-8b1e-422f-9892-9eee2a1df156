import { createSignal, onMount, Show } from 'solid-js';
import { supabase, createEvent } from './supabaseClient';

function App() {
  const [weatherData, setWeatherData] = createSignal(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(null);

  const API_ID = 'ea764266-2a18-41c9-b7b0-dac80fed3797';

  const fetchWeather = async (latitude, longitude) => {
    setLoading(true);
    setError(null);

    try {
      const result = await createEvent('call_api', {
        api_id: API_ID,
        instructions: `Fetch the current weather data for latitude: ${latitude}, longitude: ${longitude} using the Weather API.`
      });

      if (!result) {
        throw new Error('Failed to get weather data from backend.');
      }

      setWeatherData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        () => {
          setError('Unable to retrieve your location');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
    }
  };

  onMount(() => {
    getLocation();
  });

  return (
    <div class="min-h-screen flex items-center justify-center bg-blue-100 text-gray-900">
      <div class="w-full max-w-md p-6 bg-white rounded-lg shadow-md h-full">
        <h1 class="text-3xl font-bold mb-4 text-center">Local Weather</h1>
        <Show when={loading()}>
          <p class="text-center text-lg">Loading...</p>
        </Show>
        <Show when={error()}>
          <p class="text-center text-red-500 mb-4">{error()}</p>
          <button
            class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer mt-4 disabled:opacity-50"
            onClick={getLocation}
            disabled={loading()}
          >
            {loading() ? 'Loading...' : 'Try Again'}
          </button>
        </Show>
        <Show when={weatherData() && !loading() && !error()}>
          <div class="space-y-4">
            <p class="text-center text-xl font-semibold">{`Current Weather`}</p>
            <div class="flex justify-between">
              <span>Temperature:</span>
              <span>{weatherData().temp} °C</span>
            </div>
            <div class="flex justify-between">
              <span>Feels Like:</span>
              <span>{weatherData().feels_like} °C</span>
            </div>
            <div class="flex justify-between">
              <span>Humidity:</span>
              <span>{weatherData().humidity} %</span>
            </div>
            <div class="flex justify-between">
              <span>Wind Speed:</span>
              <span>{weatherData().wind_speed} m/s</span>
            </div>
            <div class="flex justify-between">
              <span>Wind Direction:</span>
              <span>{weatherData().wind_degrees}°</span>
            </div>
            <div class="flex justify-between">
              <span>Cloud Coverage:</span>
              <span>{weatherData().cloud_pct} %</span>
            </div>
            <div class="flex justify-between">
              <span>Max Temp:</span>
              <span>{weatherData().max_temp} °C</span>
            </div>
            <div class="flex justify-between">
              <span>Min Temp:</span>
              <span>{weatherData().min_temp} °C</span>
            </div>
          </div>
          <button
            class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer mt-6 disabled:opacity-50"
            onClick={getLocation}
            disabled={loading()}
          >
            {loading() ? 'Loading...' : 'Refresh'}
          </button>
        </Show>
      </div>
    </div>
  );
}

export default App;