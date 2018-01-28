require("dotenv").config();
var keys = require("./keys.js");
var Spotify = require('node-spotify-api');
var Twitter = require('twitter');
var fs = require('fs');

var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);

var proc = process.argv
var userInput = proc[2];

var acceptableInputs = [
    "my-tweets",
    "spotify-this-song",
    "movie-this",
    "do-what-it-says"
];
if (!acceptableInputs.includes(userInput)){
    console.log("Please enter a valid command. One of the following: my-tweets, spotify-this-song, movie-this, do-what-it-says");
}

if (userInput === "my-tweets") {
    console.log("my tweets");
    var params = {screen_name: "Christian Hane"};
    client.get('statuses/user_timeline', params, function(error, tweets, response) {
        if (!error) {
            for (var i = 0; i < 20; i++) {
                var tweet = "Tweet: " + tweets[i].text;
                var creationDate = "Created at: " + tweets[i].created_at;
                console.log(tweet);
                console.log(creationDate);
                fs.appendFileSync('./log.txt', tweet);
                fs.appendFileSync('./log.txt', creationDate);                
            }  
        }
    })
} else if (userInput === "spotify-this-song") {
    console.log("spotify");
    var query = proc[3];
    searchSpotify(query);
} else if (userInput === "movie-this") {
    var movieTitle = proc[3];
    movieSearch(movieTitle);
} else if (userInput === "do-what-it-says") {
    fs.readFile("./random.txt", "utf8", function(err, data) {
        var index = data.indexOf(",");
        var commandArray = [];
        var valueArray = [];
        for (var i = 0; i < index; i++) {
            commandArray.push(data[i]);
        };
        for (var j = index + 1; j < data.length; j++) {
            valueArray.push(data[j]);
        }
        var value = valueArray.join("");
        var command = commandArray.join("");
        doWhatItSays(command, value);
    });
};



function searchSpotify(query) {
    spotify.search({ type: 'track', query: query, limit: 1 }, function(err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }

        if (data.tracks.items[0] !== undefined) {
            var songInfo = {
                "Artist[s]": data.tracks.items[0].artists[0].name,
                "Song": data.tracks.items[0].name,
                "Listen": data.tracks.items[0].external_urls.spotify,
                "Album": data.tracks.items[0].album.name,
            }
            console.log(songInfo);
            fs.appendFileSync('./log.txt', JSON.stringify(songInfo));            
            return;
        } else {
            searchSpotify("The Sign");
        }
    });
};

function movieSearch(movieTitle) {
    var queryURL = "https://www.omdbapi.com/?t=" + movieTitle + "&type=movie&apikey=trilogy";
    var request = require('request');
    request(queryURL, function (err, response, body) {
        var newBody = JSON.parse(body);
        if (newBody.Response === "False") {
            movieSearch("Mr. Nobody");
        } else {
            var movieInfo = {
                "Title": newBody.Title,
                "Year": newBody.Year,
                "IMDB": newBody.imdbRating,
                "Rotten Tomatoes": newBody.Ratings[1].Value,
                "Country": newBody.Country,
                "Languages": newBody.Language,
                "Actors": newBody.Actors,
                "Plot": newBody.Plot
            }
            console.log(movieInfo);
            fs.appendFileSync('./log.txt', JSON.stringify(movieInfo));
            return;
        }   
    });
};

function doWhatItSays(command, value) {
    if (!acceptableInputs.includes(command)){
        console.log("Please enter a valid command. One of the following: my-tweets, spotify-this-song, movie-this, do-what-it-says");
    }
    
    if (command === "my-tweets") {
        console.log("my tweets");
        var params = {screen_name: "Christian Hane"};
        client.get('statuses/user_timeline', params, function(error, tweets, response) {
            if (!error) {
                for (var i = 0; i < 20; i++) {
                    var tweet = "Tweet: " + tweets[i].text;
                    var creationDate = "Created at: " + tweets[i].created_at;
                    console.log(tweet);
                    console.log(creationDate);
                    fs.appendFileSync('./log.txt', tweet);
                    fs.appendFileSync('./log.txt', creationDate);
                }  
            }
        });
    } else if (command === "spotify-this-song") {
        console.log("spotify");
        var query = value;
        searchSpotify(query);
    } else if (command === "movie-this") {
        var movieTitle = value;
        movieSearch(movieTitle);
    };
}