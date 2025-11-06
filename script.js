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

    // Get background based on weather condition and time of day
    getBackgroundForWeather: function(weatherMain, weatherDescription, timeOfDay) {
        const condition = weatherMain.toLowerCase();
        const description = weatherDescription.toLowerCase();

        // Weather-based background keywords for Unsplash
        let backgroundQuery = '';

        switch(condition) {
            case 'clear':
                if (timeOfDay === 'night') {
                    backgroundQuery = 'starry night sky';
                } else if (timeOfDay === 'morning') {
                    backgroundQuery = 'clear sunrise sky';
                } else if (timeOfDay === 'evening') {
                    backgroundQuery = 'clear sunset sky';
                } else {
                    backgroundQuery = 'clear blue sky sunshine';
                }
                break;
            case 'clouds':
                if (description.includes('few')) {
                    backgroundQuery = `partly cloudy ${timeOfDay} sky`;
                } else if (description.includes('overcast')) {
                    backgroundQuery = 'overcast grey sky';
                } else {
                    backgroundQuery = `cloudy ${timeOfDay} sky`;
                }
                break;
            case 'rain':
            case 'drizzle':
                backgroundQuery = 'rainy weather city';
                break;
            case 'thunderstorm':
                backgroundQuery = 'thunderstorm lightning storm';
                break;
            case 'snow':
                backgroundQuery = 'snowy winter landscape';
                break;
            case 'mist':
            case 'fog':
            case 'haze':
                backgroundQuery = 'foggy misty weather';
                break;
            case 'smoke':
                backgroundQuery = 'smoky hazy atmosphere';
                break;
            case 'dust':
            case 'sand':
                backgroundQuery = 'dust storm desert';
                break;
            default:
                backgroundQuery = `${timeOfDay} sky nature`;
        }

        // Add timestamp to prevent caching and get different images
        const timestamp = new Date().getTime();
        const url = `https://source.unsplash.com/1920x1080/?${encodeURIComponent(backgroundQuery)}&sig=${timestamp}`;

        console.log(`Weather: ${condition}, Time: ${timeOfDay}, Background: ${backgroundQuery}`);
        console.log(`Background URL: ${url}`);

        return url;
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

        // Set dynamic background based on weather and time
        const backgroundUrl = this.getBackgroundForWeather(weatherMain, description, timeOfDay);
        console.log("Setting background to:", backgroundUrl);
        document.body.style.backgroundImage = `url('${backgroundUrl}')`;
        console.log("Background applied successfully!");
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
weather.getLocationWeather();

