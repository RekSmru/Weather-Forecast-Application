const YOUR_API_KEY = "0722eb11f390cc378d9fb25edb624dfd";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

let isCelsius = true;
let currentTempC = 0;

// Elements
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const recentlySearchedCities = document.getElementById("recentlySearchedCities");
const errorMsg = document.getElementById("errorMsg");

const cityNameEl = document.getElementById("cityName");
const tempEl = document.getElementById("temperature");
const weatherDescEl = document.getElementById("weatherDesc");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const iconEl = document.getElementById("weatherIcon");
const alertMsgEl = document.getElementById("alertMsg");
const forecastEl = document.getElementById("forecast");
const appBg = document.getElementById("appBg");

// Events
searchBtn.addEventListener("click", searchCity);
locationBtn.addEventListener("click", getLocationWeather);
recentlySearchedCities.addEventListener("change", () => fetchCityWeather(recentlySearchedCities.value));

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.remove("hidden");
}

function clearError() {
  errorMsg.classList.add("hidden");
}

function searchCity() {
  const city = cityInput.value.trim();
  if (!city) return showError("Please enter a city name");

  fetchCityWeather(city);
  saveRecentlySearchedCities(city);
  cityInput.value = "";
}

async function fetchCityWeather(city) {
  clearError();

  try {
    const res = await fetch(
      `${BASE_URL}/weather?q=${city}&units=metric&appid=${YOUR_API_KEY}`
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "City not found");
    }

    updateToday(data);
    fetchForecast(data.coord.lat, data.coord.lon);

  } catch (err) {
    showError(err.message);
  }
}

function updateToday(data) {
  cityNameEl.textContent = data.name;

  currentTempC = data.main.temp;
  tempEl.textContent = `${Math.round(currentTempC)}°C`;

  weatherDescEl.textContent = data.weather[0].main;
  humidityEl.textContent = data.main.humidity;
  windEl.textContent = data.wind.speed;

  const condition = data.weather[0].main.toLowerCase();

  // Alert
  alertMsgEl.textContent = currentTempC > 40 ? "⚠ Extreme Heat Alert!" : "";

  // Icons + background
  if (condition.includes("rain")) {
    iconEl.src = "./images/rain.png";
    appBg.className = "bg-gray-700 min-h-screen";
  } 
  else if (condition.includes("cloudy") || condition.includes("cloud")) {
    iconEl.src = "./images/cloud.png";
  } 
  else if (condition.includes("snow")) {
    iconEl.src = "./images/snow.png";
  } 
  else {
    iconEl.src = "./images/sunny.png";
  }

  // 🌟 AUTO WEATHER CARD HIGHLIGHT
  highlightWeatherCard(data);
}


/* -----------------------------
   🌦️ WEATHER CARD HIGHLIGHT
------------------------------*/
function highlightWeatherCard(data) {
  const condition = data.weather[0].main.toLowerCase();
  const humidity = data.main.humidity;
  const wind = data.wind.speed;

  const cards = ["sunny", "cloudy", "windy", "humidity"];

  // reset
  cards.forEach(type => {
    const el = document.getElementById(type + "Card");
    if (el) {
      el.classList.add("opacity-40");
      el.classList.remove("opacity-100", "scale-110", "ring-4", "ring-white");
    }
  });

  let active = "";

  if (condition.includes("clear")) {
    active = "sunny";
  } 
  else if (condition.includes("cloud")) {   
    active = "cloudy";
  } 
  else if (condition.includes("rain")) {
    active = "humidity"; // or create "rainy"
  } 
  else if (wind > 6) {
    active = "windy";
  } 
  else if (humidity > 70) {
    active = "humidity";
  }

  const activeEl = document.getElementById(active + "Card");

  if (activeEl) {
    activeEl.classList.remove("opacity-40");
    activeEl.classList.add("opacity-100", "scale-110", "ring-4", "ring-white");
  }
}

/* -----------------------------
   📍 RECENT CITIES
------------------------------*/
function saveRecentlySearchedCities(city) {
  let cities = JSON.parse(localStorage.getItem("cities")) || [];
  if (!cities.includes(city)) cities.unshift(city);

  cities = cities.slice(0, 5);
  localStorage.setItem("cities", JSON.stringify(cities));

  renderRecentlySearchedCities();
}

function renderRecentlySearchedCities() {
  const cities = JSON.parse(localStorage.getItem("cities")) || [];

  if (!cities.length) return;

  recentlySearchedCities.classList.remove("hidden");
  recentlySearchedCities.innerHTML = `<option value="">Recently searched Cities</option>`;

  cities.forEach(c => {
    recentlySearchedCities.innerHTML += `<option value="${c}">${c}</option>`;
  });
}

/* -----------------------------
   🌤️ FORECAST
------------------------------*/
async function fetchForecast(lat, lon) {
  const res = await fetch(
    `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${YOUR_API_KEY}`
  );
  const data = await res.json();

  // ✅ CLEAR OLD DATA (IMPORTANT)
  forecastEl.innerHTML = "";

  const days = data.list.filter(item =>
    item.dt_txt.includes("12:00")
  );

  days.forEach(day => {
    forecastEl.innerHTML += `
      <div class="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white p-3 rounded-xl shadow-lg flex justify-between items-center">
        <p class="font-bold w-1/3">
          ${new Date(day.dt_txt).toDateString()}
        </p>

        <p class="w-1/3 text-center">
          🌡 ${Math.round(day.main.temp)}°C
        </p>

        <div class="w-1/3 text-right">
          <p>🌬 ${day.wind.speed} m/s</p>
          <p>💧 ${day.main.humidity}%</p>
        </div>

      </div>
    `;
  });
}
// Init
renderRecentlySearchedCities();