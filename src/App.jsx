import { createSignal, onMount, Show } from 'solid-js';
import { supabase, createEvent } from './supabaseClient';

function App() {
  const [weatherData, setWeatherData] = createSignal(null);
  const [airportData, setAirportData] = createSignal(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(null);
  const [cityName, setCityName] = createSignal('');
  const [manualCityInput, setManualCityInput] = createSignal(false);

  const WEATHER_API_ID = 'ea764266-2a18-41c9-b7b0-dac80fed3797';
  const AIRPORT_API_ID = '5d95b035-7472-4ad8-948f-26939403c4fc';
  const REVERSE_GEOCODING_API_ID = '135abacb-eae5-489b-9fb1-e3cca6ac8004';

  const fetchWeatherAndAirport = async (latitude, longitude) => {
    setLoading(true);
    setError(null);

    try {
      const weatherResult = await createEvent('call_api', {
        api_id: WEATHER_API_ID,
        instructions: `Fetch the current weather data for latitude: ${latitude}, longitude: ${longitude} using the Weather API.`
      });

      if (!weatherResult) {
        throw new Error('Failed to get weather data from backend.');
      }

      setWeatherData(weatherResult);

      let city = cityName();

      if (!city) {
        const reverseGeocodeResult = await createEvent('call_api', {
          api_id: REVERSE_GEOCODING_API_ID,
          instructions: `Find the city for latitude: ${latitude}, longitude: ${longitude} using the Reverse Geocoding API.`
        });

        if (reverseGeocodeResult && reverseGeocodeResult.length > 0) {
          city = reverseGeocodeResult[0].name;
          setCityName(city);
        } else {
          setManualCityInput(true);
          setError('Unable to determine your city automatically. Please enter your city.');
          setLoading(false);
          return;
        }
      }

      const airportResult = await createEvent('call_api', {
        api_id: AIRPORT_API_ID,
        instructions: `Find airports in the city: ${city} using the Airports API. Return a list of airports with their details.`
      });

      if (!airportResult || airportResult.length === 0) {
        throw new Error('Failed to get airport data from backend.');
      }

      // Compute distance to each airport and find the closest one
      const airportsWithDistance = airportResult.map((airport) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          parseFloat(airport.latitude),
          parseFloat(airport.longitude)
        );
        return { ...airport, distance };
      });

      // Sort airports by distance
      airportsWithDistance.sort((a, b) => a.distance - b.distance);

      // Set the closest airport
      setAirportData(airportsWithDistance[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Earth radius in kilometers
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // in kilometers

    return distance;
  };

  const getLocation = () => {
    setManualCityInput(false);
    setCityName('');
    setWeatherData(null);
    setAirportData(null);
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherAndAirport(position.coords.latitude, position.coords.longitude);
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

  const handleCitySubmit = async () => {
    if (!cityName()) {
      setError('Please enter a city name.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const weatherResult = await createEvent('call_api', {
        api_id: WEATHER_API_ID,
        instructions: `Fetch the current weather data for the city: ${cityName()} using the Weather API.`
      });

      if (!weatherResult) {
        throw new Error('Failed to get weather data from backend.');
      }

      setWeatherData(weatherResult);

      const airportResult = await createEvent('call_api', {
        api_id: AIRPORT_API_ID,
        instructions: `Find airports in the city: ${cityName()} using the Airports API. Return a list of airports with their details.`
      });

      if (!airportResult || airportResult.length === 0) {
        throw new Error('Failed to get airport data from backend.');
      }

      // We don't have coordinates, so we can't calculate distance
      setAirportData(airportResult[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  onMount(() => {
    getLocation();
  });

  return (
    <div class="min-h-screen flex items-center justify-center bg-blue-100 text-gray-900">
      <div class="w-full max-w-md p-6 bg-white rounded-lg shadow-md h-full">
        <h1 class="text-3xl font-bold mb-4 text-center">Local Weather & Nearest Airport</h1>
        <Show when={loading()}>
          <p class="text-center text-lg">Loading...</p>
        </Show>
        <Show when={error()}>
          <p class="text-center text-red-500 mb-4">{error()}</p>
          <Show when={manualCityInput()}>
            <div class="mb-4">
              <input
                type="text"
                value={cityName()}
                onInput={(e) => setCityName(e.target.value)}
                placeholder="Enter your city"
                class="w-full px-4 py-2 border border-gray-300 rounded box-border"
              />
            </div>
            <button
              class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer disabled:opacity-50 cursor-pointer"
              onClick={handleCitySubmit}
              disabled={loading()}
            >
              {loading() ? 'Loading...' : 'Submit'}
            </button>
          </Show>
          <button
            class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer mt-4 disabled:opacity-50 cursor-pointer"
            onClick={getLocation}
            disabled={loading()}
          >
            {loading() ? 'Loading...' : 'Try Again'}
          </button>
        </Show>
        <Show when={!loading() && !error()}>
          <div class="space-y-6">
            <Show when={weatherData()}>
              <div class="space-y-4">
                <p class="text-center text-xl font-semibold">Current Weather</p>
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
            </Show>

            <Show when={airportData()}>
              <div class="space-y-4 mt-6">
                <p class="text-center text-xl font-semibold">Nearest Airport</p>
                <div class="flex justify-between">
                  <span>Airport Name:</span>
                  <span>{airportData().name}</span>
                </div>
                <div class="flex justify-between">
                  <span>City:</span>
                  <span>{airportData().city}</span>
                </div>
                <div class="flex justify-between">
                  <span>Country:</span>
                  <span>{airportData().country}</span>
                </div>
                <div class="flex justify-between">
                  <span>IATA Code:</span>
                  <span>{airportData().iata}</span>
                </div>
                <div class="flex justify-between">
                  <span>ICAO Code:</span>
                  <span>{airportData().icao}</span>
                </div>
                <Show when={airportData().distance}>
                  <div class="flex justify-between">
                    <span>Distance:</span>
                    <span>{airportData().distance.toFixed(2)} km</span>
                  </div>
                </Show>
              </div>
            </Show>

            <button
              class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer mt-6 disabled:opacity-50 cursor-pointer"
              onClick={getLocation}
              disabled={loading()}
            >
              {loading() ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </Show>
      </div>
    </div>
  );
}

export default App;