const form = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");
const message = document.querySelector("#message");
const weatherCard = document.querySelector("#weather-card");

const weatherDescriptions = {
  0: ["Clear sky", "☀️"],
  1: ["Mainly clear", "🌤️"],
  2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁️"],
  45: ["Fog", "🌫️"],
  48: ["Depositing rime fog", "🌫️"],
  51: ["Light drizzle", "🌦️"],
  53: ["Moderate drizzle", "🌦️"],
  55: ["Dense drizzle", "🌧️"],
  61: ["Slight rain", "🌦️"],
  63: ["Moderate rain", "🌧️"],
  65: ["Heavy rain", "🌧️"],
  71: ["Slight snow", "🌨️"],
  73: ["Moderate snow", "🌨️"],
  75: ["Heavy snow", "❄️"],
  80: ["Rain showers", "🌦️"],
  81: ["Moderate rain showers", "🌧️"],
  82: ["Violent rain showers", "⛈️"],
  95: ["Thunderstorm", "⛈️"],
  96: ["Thunderstorm with hail", "⛈️"],
  99: ["Severe thunderstorm with hail", "⛈️"]
};

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}

async function getWeather(city) {
  showMessage("Loading weather...");
  weatherCard.hidden = true;

  try {
    // Find the city's latitude and longitude.
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const geoResponse = await fetch(geoUrl);
    if (!geoResponse.ok) throw new Error("Could not search for that city.");
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found. Check the spelling and try again.");
    }

    const place = geoData.results[0];
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;
    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) throw new Error("Weather data is temporarily unavailable.");
    const weatherData = await weatherResponse.json();
    const current = weatherData.current;

    const [description, icon] = weatherDescriptions[current.weather_code] || ["Weather conditions", "🌡️"];
    document.querySelector("#city-name").textContent =
      `${place.name}${place.admin1 ? ", " + place.admin1 : ""}`;
    document.querySelector("#date-text").textContent =
      new Date(current.time).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
    document.querySelector("#weather-icon").textContent = icon;
    document.querySelector("#condition").textContent = description;
    document.querySelector("#temperature").textContent = Math.round(current.temperature_2m);
    document.querySelector("#feels-like").textContent =
      `Feels like ${Math.round(current.apparent_temperature)}°C`;
    document.querySelector("#humidity").textContent = `${current.relative_humidity_2m}%`;
    document.querySelector("#wind").textContent = `${current.wind_speed_10m} km/h`;

    weatherCard.hidden = false;
    showMessage("Here is the latest available weather for your city.");
  } catch (error) {
    showMessage(error.message || "Something went wrong. Please try again.", true);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();
  if (city) getWeather(city);
});

// Show a useful example when the app first opens.
getWeather("Kurnool");
