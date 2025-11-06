let weather={
    // Fetch weather by city name (first geocode, then get weather)
    fetchWeather: function(city) {
        console.log("Fetching weather for city:", city);
        // First, get coordinates for the city using geocoding API
        fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`)
        .then((response)=> response.json())
        .then((data) => {
            console.log("Geocoding data:", data);
            if (data.results && data.results.length > 0) {
                const location = data.results[0];
                const lat = location.latitude;
                const lon = location.longitude;
                const cityName = location.name;
                const country = location.country;
                console.log(`Found: ${cityName}, ${country} at ${lat}, ${lon}`);
                this.fetchWeatherByCoords(lat, lon, `${cityName}, ${country}`);
            } else {
                console.error("City not found");
                document.querySelector(".city").innerText = "City not found";
            }
        })
        .catch((error) => console.error("Error fetching location:", error));
    },

    // Fetch weather by coordinates using Open-Meteo API
    fetchWeatherByCoords: function(lat, lon, locationName = null) {
        console.log("Fetching weather for coordinates:", lat, lon);
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,is_day&timezone=auto`)
        .then((response)=> {
            console.log("Weather API response:", response);
            return response.json();
        })
        .then((data) => {
            console.log("Weather data:", data);
            // Add location name to data
            if (locationName) {
                data.locationName = locationName;
            } else {
                data.locationName = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
            }
            this.displayWeather(data);
        })
        .catch((error) => console.error("Error fetching weather:", error));
    },

    // Convert Open-Meteo weather code to condition
    getWeatherCondition: function(weatherCode) {
        // WMO Weather interpretation codes
        if (weatherCode === 0) return { main: 'clear', description: 'Clear sky' };
        if (weatherCode === 1) return { main: 'clouds', description: 'Mainly clear' };
        if (weatherCode === 2) return { main: 'clouds', description: 'Partly cloudy' };
        if (weatherCode === 3) return { main: 'clouds', description: 'Overcast' };
        if (weatherCode === 45 || weatherCode === 48) return { main: 'fog', description: 'Foggy' };
        if (weatherCode >= 51 && weatherCode <= 57) return { main: 'drizzle', description: 'Drizzle' };
        if (weatherCode >= 61 && weatherCode <= 67) return { main: 'rain', description: 'Rain' };
        if (weatherCode >= 71 && weatherCode <= 77) return { main: 'snow', description: 'Snow' };
        if (weatherCode >= 80 && weatherCode <= 82) return { main: 'rain', description: 'Rain showers' };
        if (weatherCode >= 85 && weatherCode <= 86) return { main: 'snow', description: 'Snow showers' };
        if (weatherCode >= 95 && weatherCode <= 99) return { main: 'thunderstorm', description: 'Thunderstorm' };
        return { main: 'clouds', description: 'Cloudy' };
    },

    // Get weather icon based on condition
    getWeatherIcon: function(condition, isDay) {
        const icons = {
            'clear': isDay ? '☀️' : '🌙',
            'clouds': '☁️',
            'rain': '🌧️',
            'drizzle': '🌦️',
            'thunderstorm': '⛈️',
            'snow': '❄️',
            'fog': '🌫️',
            'mist': '🌫️',
            'haze': '🌫️'
        };
        return icons[condition] || '🌤️';
    },

    // Get time of day based on current hour and isDay flag
    getTimeOfDay: function(isDay, currentTime) {
        // Parse hour from ISO 8601 time string
        const date = new Date(currentTime);
        const hour = date.getHours();

        if (!isDay) {
            return 'night';
        } else if (hour >= 5 && hour < 12) {
            return 'morning';
        } else if (hour >= 12 && hour < 17) {
            return 'afternoon';
        } else if (hour >= 17 && hour < 20) {
            return 'evening';
        } else {
            return 'night';
        }
    },

    // Get background gradient based on weather condition and time of day
    getBackgroundForWeather: function(weatherMain, weatherDescription, timeOfDay) {
        const condition = weatherMain.toLowerCase();
        const description = weatherDescription.toLowerCase();

        let gradient = '';

        switch(condition) {
            case 'clear':
                if (timeOfDay === 'night') {
                    // Starry night - deep blue to purple
                    gradient = 'linear-gradient(to bottom, #0f2027, #203a43, #2c5364)';
                } else if (timeOfDay === 'morning') {
                    // Sunrise - warm oranges and yellows
                    gradient = 'linear-gradient(to bottom, #ff6b6b, #feca57, #48dbfb)';
                } else if (timeOfDay === 'evening') {
                    // Sunset - orange to purple
                    gradient = 'linear-gradient(to bottom, #ff6348, #ff7f50, #ee5a6f, #c44569)';
                } else {
                    // Clear day - bright blue
                    gradient = 'linear-gradient(to bottom, #56ccf2, #2f80ed)';
                }
                break;

            case 'clouds':
                if (description.includes('few')) {
                    // Partly cloudy
                    gradient = 'linear-gradient(to bottom, #bdc3c7, #2c3e50)';
                } else if (description.includes('overcast')) {
                    // Overcast - grey
                    gradient = 'linear-gradient(to bottom, #757f9a, #d7dde8)';
                } else {
                    // Cloudy
                    gradient = 'linear-gradient(to bottom, #7f8c8d, #95a5a6, #bdc3c7)';
                }
                break;

            case 'rain':
            case 'drizzle':
                // Rainy - dark blue grey
                gradient = 'linear-gradient(to bottom, #304352, #556270, #667db6)';
                break;

            case 'thunderstorm':
                // Thunderstorm - dark dramatic
                gradient = 'linear-gradient(to bottom, #1e3c72, #2a5298, #7e8ba3)';
                break;

            case 'snow':
                // Snowy - white to light blue
                gradient = 'linear-gradient(to bottom, #e6e9f0, #a8b8d8, #7f8fa6)';
                break;

            case 'mist':
            case 'fog':
            case 'haze':
                // Foggy - soft grey
                gradient = 'linear-gradient(to bottom, #c2cad0, #a6b1bb, #8a9aa6)';
                break;

            case 'smoke':
                // Smoky - warm grey
                gradient = 'linear-gradient(to bottom, #8b7e74, #7d6e5f, #5f4e3d)';
                break;

            case 'dust':
            case 'sand':
                // Dusty - sandy colors
                gradient = 'linear-gradient(to bottom, #c79081, #dfa579, #e0c097)';
                break;

            default:
                // Default based on time of day
                if (timeOfDay === 'night') {
                    gradient = 'linear-gradient(to bottom, #141e30, #243b55)';
                } else {
                    gradient = 'linear-gradient(to bottom, #4ca1af, #c4e0e5)';
                }
        }

        console.log(`Weather: ${condition}, Time: ${timeOfDay}, Gradient: ${gradient}`);

        return gradient;
    },

    displayWeather: function(data) {
        console.log("Weather data received:", data);

        const locationName = data.locationName;
        const current = data.current;

        // Extract weather data from Open-Meteo
        const temp = current.temperature_2m;
        const humidity = current.relative_humidity_2m;
        const windSpeed = current.wind_speed_10m;
        const weatherCode = current.weather_code;
        const isDay = current.is_day; // 1 for day, 0 for night
        const currentTime = current.time;

        // Get weather condition from code
        const weatherCondition = this.getWeatherCondition(weatherCode);
        const weatherMain = weatherCondition.main;
        const description = weatherCondition.description;

        // Get time of day
        const timeOfDay = this.getTimeOfDay(isDay, currentTime);

        // Get weather icon
        const icon = this.getWeatherIcon(weatherMain, isDay);

        // Update weather info
        document.querySelector(".city").innerText = "Weather in " + locationName;
        document.querySelector(".icon").innerText = icon; // Use emoji icon
        document.querySelector(".icon").style.fontSize = "64px"; // Make icon larger
        document.querySelector(".description").innerText = description;
        document.querySelector(".temp").innerText = temp + "°C";
        document.querySelector(".humidity").innerText = "Humidity: " + humidity + "%";
        document.querySelector(".wind").innerText = "Wind speed: " + windSpeed + " km/h";
        document.querySelector(".weather").classList.remove("loading");

        // Background remains as nnnnnnnn.jpg (static image)
        console.log("Weather displayed. Background stays as nnnnnnnn.jpg");
    },

    search: function (){
        this.fetchWeather(document.querySelector(".search-bar").value)
    },

    // Get user's geolocation and fetch weather
    getLocationWeather: function() {
        console.log("Getting location weather...");
        if (navigator.geolocation) {
            document.querySelector(".city").innerText = "Detecting location...";
            console.log("Requesting geolocation...");
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    console.log("Location detected:", lat, lon);
                    this.fetchWeatherByCoords(lat, lon);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    document.querySelector(".city").innerText = "Location access denied";
                    // Fallback to default city
                    console.log("Falling back to Delhi");
                    this.fetchWeather("Delhi");
                }
            );
        } else {
            console.log("Geolocation not supported");
            // Fallback to default city
            this.fetchWeather("Delhi");
        }
    }
};

document.querySelector(".search-btn").addEventListener("click", function(){
    weather.search();
});

document.querySelector(".location-btn").addEventListener("click", function(){
    weather.getLocationWeather();
});

document.querySelector(".search-bar").addEventListener("keyup", function(event){
    if (event.key == "Enter"){
        weather.search();
    }
});

// Function to get the current date and time
function getCurrentDateAndTime() {
    const dateTime = new Date();
    return dateTime.toLocaleString();
}

// Target an HTML element to display the current date and time
const dateDisplay = document.getElementById("date-time");

// Set the innerHTML of the element to the current date and time returned by the function
dateDisplay.innerHTML = getCurrentDateAndTime();

// Update date and time every second
setInterval(() => {
    dateDisplay.innerHTML = getCurrentDateAndTime();
}, 1000);

// On page load, get weather based on user's location
// Background starts with nnnnnnnn.jpg from CSS, then changes to gradient based on weather
console.log("Starting weather fetch...");
weather.getLocationWeather();

