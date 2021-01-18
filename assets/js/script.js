// JavaScript

var myAPI = "af6923e95cbb6c53be8ceb07c2b776e5"
var savedHistory = JSON.parse(localStorage.getItem("searches")) || ["New York"];

//function to search and display today's weather
function weatherSearch (cityname) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityname + "&appid=" + myAPI;
    
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        console.log(response);
        var tempF = (response.main.temp - 273.15) * 1.80 + 32;
        var windMph = (response.wind.speed * 2.23694);
        $(".city").empty().append(response.name);
        $(".icon").empty().attr("src", "https://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png");
        $(".temp").empty().append("Temperature: " + tempF.toFixed() + " °F");
        $(".humidity").empty().append("Humidity: " + response.main.humidity + "%");
        $(".wind").empty().append("Wind Speed: " + windMph.toFixed(1) + " mph");
        
        var lat = response.coord.lat;
        var lon = response.coord.lon;

        uvAndTime(lat, lon);
    });
}

// function to search UV Index and current date
function uvAndTime(lat, lon) {
    var queryURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + myAPI + "&lat=" + lat + "&lon=" + lon;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        console.log(response);

        $(".uv").empty().removeClass("red; yellow; green");
        var uv = response.value.toFixed(1);
        //UV index changes color: low = green, moderate = yellow, severe = red;
        //UV index according to US EPA: https://19january2017snapshot.epa.gov/sunsafety/uv-index-scale-1_.html#:~:text=3%20to%205%3A%20Moderate,%2C%20and%20UV%2Dblocking%20sunglasses.
        if (parseInt(uv) <= 2) {
            document.querySelector(".uv").setAttribute('style', 'background-color: green !important; color: white');
        }
        else if (parseInt(uv) > 5) {
            document.querySelector(".uv").setAttribute('style', 'background-color: red !important; color: white');
        }
        else {
            document.querySelector(".uv").setAttribute('style', 'background-color: yellow !important');
        }
        $(".uv").append("UV Index: " + uv);
        $(".date").empty().append("(" + response.date_iso.split("T")[0] + ")");
    });
}

//function to search for a 5-day weather forecast
function weatherSearch5(cityname) {
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityname + "&appid=" + myAPI;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        var show5days = document.querySelectorAll(".future");
        for (i = 0; i < show5days.length; i++) {
            show5days[i].textContent = "";
            // var "index" below will grab weather at every day at 3:00pm
            var index = (i * 8) + 3;
            var dateEl = document.createElement("p");
            dateEl.setAttribute("class", "tempFont");
            dateEl.textContent = "(" + response.list[index].dt_txt.split(" ")[0] + ")";
            show5days[i].append(dateEl);

            var iconEl = document.createElement("img");
            iconEl.setAttribute("src","https://openweathermap.org/img/wn/" + response.list[index].weather[0].icon + ".png");
            show5days[i].append(iconEl);

            var tempEl = document.createElement("p");
            tempEl.setAttribute("class", "tempFont");
            var tempF = (response.list[index].main.temp - 273.15) * 1.80 + 32;
            tempEl.textContent = "Temp: " + tempF.toFixed() + " °F";
            show5days[i].append(tempEl);

            var humEl = document.createElement("p");
            humEl.setAttribute("class", "tempFont");
            humEl.innerHTML = "Humidity: " + response.list[index].main.humidity + "%";
            show5days[i].append(humEl);
        }
    });
}

// call functions weatherSearch() and weatherSearch5() on click to display today's weather and 5-day forecast
$(".btn").on("click", function(){
    var cityname = $("#input1").val().trim();
    weatherSearch(cityname);
    weatherSearch5(cityname);
    $(".hidden").removeClass("hidden");
    $("#input1").val("");
    savedHistory.push(cityname);
    localStorage.setItem("searches", JSON.stringify(savedHistory));
    showHistory();
});

// function to show recently searched cities
function showHistory() {
    document.querySelector("#searchedCities").textContent = "";
    for (var i = 0; i < savedHistory.length; i++) {
        var recentEl = document.createElement("input");
        recentEl.setAttribute("class", "list-group-item");
        recentEl.setAttribute("type","text");
        recentEl.setAttribute("readonly",true);
        recentEl.setAttribute("value", savedHistory[i]);
        document.querySelector("#searchedCities").prepend(recentEl);
    }
}

// function to show searched history on click
$("#searchedCities").on("click", "input", function() {
    weatherSearch($(this).val());
    weatherSearch5($(this).val());
        });

// call function to display searched cities
showHistory();

// check if saved history is not empty; if it is not empty call functions for weather forecast and for a 5-day forecast
if (savedHistory.length > 0) {
    $(".hidden").removeClass("hidden");
    weatherSearch(savedHistory[savedHistory.length - 1]);
    weatherSearch5(savedHistory[savedHistory.length - 1]);
}

//call weather Search function
// weatherSearch();