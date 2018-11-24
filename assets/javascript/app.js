$(document).ready(function() {
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyA7WgGhc4fAx_TOoUh4He6KIyQ3IE30apA",
    authDomain: "my-own-kind-of-music.firebaseapp.com",
    databaseURL: "https://my-own-kind-of-music.firebaseio.com",
    projectId: "my-own-kind-of-music",
    storageBucket: "my-own-kind-of-music.appspot.com",
    messagingSenderId: "882336588397"
  };
  firebase.initializeApp(config);

  $(".googleAuth").on("click", function(event) {
    event.preventDefault();
    console.log("HI");
    var provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth().signInWithRedirect(provider);

    firebase
      .auth()
      .getRedirectResult()
      .then(function(result) {
        if (result.credential) {
          // This gives you a Google Access Token. You can use it to access the Google API.
          var token = result.credential.accessToken;
          // ...
        }
        // The signed-in user info.
        var user = result.user;
        $(".googleAuth").text(user);
        console.log("USER INFO:" + result);
      })
      .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
      });
  });

  var apiKeySetlist = "3a496f6a-3766-4b9c-9b46-c5a0975f8178";
  var apiKeyTM = "b1S51DkqT3BXxnjeVWCAX1GeeJ1UdyTB";

  $(".initialInput").on("submit", function(event) {
    $(".output").html("");

    event.preventDefault();
    var zipCode = $(".zipInput").val();
    var artistInput = $(".artistInput").val();
    $(".zipInput").val("");
    $(".artistInput").val("");
    var covers = [];

    takeZip(zipCode, covers, artistInput);
  });

  function takeArtist(artist, covers, artistInput) {
    artistURL = artist.replace(/\s/g, "%20");
    $.ajax({
      url: `https://cors-anywhere.herokuapp.com/https://api.setlist.fm/rest/1.0/search/setlists?artistName=${artistURL}`,
      method: "GET",
      headers: {
        "x-api-key": "3a496f6a-3766-4b9c-9b46-c5a0975f8178",
        Accept: "application/json"
      },
      dataType: "json"
    }).then(function(response) {
      for (let setArray of response.setlist) {
        if (setArray.sets.set.length != 0) {
          var songArray = setArray.sets.set[0].song;
          for (let songObj of songArray) {
            if ("cover" in songObj && !inArray(songObj.name, covers)) {
              console.log(
                `${songObj.name} is a cover of ${
                  songObj.cover.name
                } performed by ${setArray.artist.name}`
              );
              if (artistInput.length > 0) {
                if (songObj.cover.name == artistInput) {
                  let outputDiv = $("<div>");
                  outputDiv.html(
                    `${songObj.name} is a cover of ${
                      songObj.cover.name
                    } performed by ${setArray.artist.name}`
                  );
                  outputDiv.attr("class", "outputDiv");
                  $(".output").append(outputDiv);
                  covers.push(songObj.name);
                }
              }else{
                let outputDiv = $("<div>");
                  outputDiv.html(
                    `${songObj.name} is a cover of ${
                      songObj.cover.name
                    } performed by ${setArray.artist.name}`
                  );
                  outputDiv.attr("class", "outputDiv");
                  $(".output").append(outputDiv);
                  covers.push(songObj.name);
              }
            }
          }
        }
      }
    });
  }

  function takeZip(zip, covers, artistInput) {
    zip = zip.replace(/\s/g, "%20");
    $.ajax({
      url: `https://app.ticketmaster.com/discovery/v2/events.json?size=10&apikey=${apiKeyTM}&radius=1&unit=miles&city=${zip}&sort=date,asc&segmentId=KZFzniwnSyZfZ7v7nJ`,
      method: "GET",
      dataType: "json"
    }).then(function(response) {
      var nameArray = [];
      for (let event of response._embedded.events) {
        var name = event.name;
        console.log(name);
        if (name.indexOf(":") >= 0) {
          name = name.slice(0, name.indexOf(":"));
        }
        if (name.indexOf(" - ") >= 0) {
          name = name.slice(0, name.indexOf(" - "));
        }
        if (name.indexOf(",") >= 0) {
          name = name.split(",");
        }
        nameArray.push(name);
      }
      var array2 = [];
      printArray(nameArray);
      function printArray(given1) {
        for (let i = 0; i < given1.length; i++) {
          if (Array.isArray(given1[i])) {
            printArray(given1[i]);
          } else {
            array2.push(given1[i].trim());
          }
        }
      }
      for (let artist of array2) {
        takeArtist(artist, covers, artistInput);
      }
    });
  }
  function inArray(thing, array) {
    for (item of array) {
      if (thing == item) {
        return true;
      }
    }
    return false;
  }
});
