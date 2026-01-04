const YOUR_API_KEY = "0722eb11f390cc378d9fb25edb624dfd"; // Replace with your real API key
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
const unitToggle = document.getElementById("unitToggle");
const forecastEl = document.getElementById("forecast");
const appBg = document.getElementById("appBg");

// Events
searchBtn.addEventListener("click", searchCity);
locationBtn.addEventListener("click", getLocationWeather);
unitToggle.addEventListener("click", toggleUnit);
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
    const res = await fetch(`${BASE_URL}/weather?q=${city}&units=metric&appid=${YOUR_API_KEY}`);
    const data = await res.json();
    if (data.cod !== 200) throw new Error();
    updateToday(data);
    fetchForecast(data.coord.lat, data.coord.lon);
  } catch {
    showError("City not found. Please try again.");
  }
}

function getLocationWeather() {
  navigator.geolocation.getCurrentPosition(pos => {
    fetch(`${BASE_URL}/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&units=metric&appid=${YOUR_API_KEY}`)
      .then(res => res.json())
      .then(updateToday);
  });
}

function updateToday(data) {
  cityNameEl.textContent = data.name;
  currentTempC = data.main.temp;
  tempEl.textContent = `${Math.round(currentTempC)}°C`;
  weatherDescEl.textContent = data.weather[0].main;
  humidityEl.textContent = data.main.humidity;
  windEl.textContent = data.wind.speed;

  // Alerts
  alertMsgEl.textContent = currentTempC > 40 ? "⚠ Extreme Heat Alert!" : "";

  // Icons & background
  const condition = data.weather[0].main.toLowerCase();
  if (condition.includes("rain")) {
    iconEl.src = "./images/rain.png";
    appBg.className = "bg-gray-700 min-h-screen";
  } else if (condition.includes("cloud")) {
    iconEl.src = "./images/cloud.png";
  } else if (condition.includes("snow")) {
    iconEl.src = "./images/snow.png";
  } else {
    iconEl.src = "./images/sunny.png";
  }
}

function toggleUnit() {
  isCelsius = !isCelsius;
  tempEl.textContent = isCelsius
    ? `${Math.round(currentTempC)}°C`
    : `${Math.round(currentTempC * 9 / 5 + 32)}°F`;
}

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

async function fetchForecast(lat, lon) {
  const res = await fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${YOUR_API_KEY}`);
  const data = await res.json();
  forecastEl.innerHTML = "";

  const days = data.list.filter(item => item.dt_txt.includes("12:00"));
  days.forEach(day => {
    forecastEl.innerHTML += `
      <div class="bg-sky-200 text-gray-600 p-2 rounded-lg text-center gap-2">
        <p class="font-bold">${new Date(day.dt_txt).toDateString()}</p>
        <p>🌡 ${Math.round(day.main.temp)}°C</p>
        <p>🌬 ${day.wind.speed} m/s</p>
        <p>💧 ${day.main.humidity}%</p>
      </div>
    `;
  });
}

renderRecentlySearchedCities();