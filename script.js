let weather={
    "apiKey": "8a325d134d29aa38fb54708d57f80d3a",

    // Fetch weather by city name
    fetchWeather: function(city) {
        console.log("Fetching weather for city:", city);
        fetch("https://api.openweathermap.org/data/2.5/weather?q="
        + city
        + "&units=metric&appid="
        + this.apiKey
        )
        .then((response)=> {
            console.log("Weather API response:", response);
            return response.json();
        })
        .then((data) => this.displayWeather(data))
        .catch((error) => console.error("Error fetching weather:", error));
    },

    // Fetch weather by coordinates (for geolocation)
    fetchWeatherByCoords: function(lat, lon) {
        console.log("Fetching weather for coordinates:", lat, lon);
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`)
        .then((response)=> {
            console.log("Weather API response:", response);
            return response.json();
        })
        .then((data) => this.displayWeather(data))
        .catch((error) => console.error("Error fetching weather:", error));
    },

    // Get time of day based on sunrise/sunset and current time
    getTimeOfDay: function(sunrise, sunset, timezone) {
        const now = Math.floor(Date.now() / 1000);
        const localNow = now + timezone;
        const localSunrise = sunrise + timezone;
        const localSunset = sunset + timezone;

        const hour = new Date(localNow * 1000).getUTCHours();

        if (localNow < localSunrise || localNow > localSunset) {
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

        const { name } = data;
        const { icon, description, main: weatherMain } = data.weather[0];
        const { temp, humidity } = data.main;
        const { speed } = data.wind;
        const { sunrise, sunset, timezone } = data.sys;

        // Get time of day
        const timeOfDay = this.getTimeOfDay(sunrise, sunset, timezone);

        // Update weather info
        document.querySelector(".city").innerText= "Weather in " +  name;
        document.querySelector(".icon").src="http://openweathermap.org/img/wn/" + icon + "@2x.png";
        document.querySelector(".description").innerText = description;
        document.querySelector(".temp").innerText = temp + "°C" ;
        document.querySelector(".humidity").innerText = "Humidity: " + humidity + "%" ;
        document.querySelector(".wind").innerText = "Wind speed: " + speed + "km/hr" ;
        document.querySelector(".weather").classList.remove("loading");

        // Set dynamic background gradient based on weather and time
        const backgroundGradient = this.getBackgroundForWeather(weatherMain, description, timeOfDay);
        console.log("Setting background to:", backgroundGradient);

        // Apply gradient background
        document.body.style.background = backgroundGradient;
        document.body.style.backgroundAttachment = 'fixed';

        console.log("Background gradient applied successfully!");
        console.log("Current body background:", document.body.style.background);
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

// Test: Set initial background immediately to verify it works
console.log("Testing background functionality...");
document.body.style.background = "linear-gradient(to bottom, #4ca1af, #c4e0e5)";
console.log("Test background gradient set");

// On page load, get weather based on user's location immediately
console.log("Starting weather fetch...");
weather.getLocationWeather();

