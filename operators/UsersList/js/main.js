"use strict";
var debug = 0;
var object = {baseURL: null, username: null, url: null};


//***********************
//	 Ready document
//***********************
$(document).ready(function() {
	
	console.log("Operator (users' retrieval) is loading");

	var getURL = function getURL(baseURL){
		object["baseURL"] = baseURL + "/users";
	}
	MashupPlatform.wiring.registerCallback("url", getURL);
	

	var getMedicalStaff = function getMedicalStaff(username){
		object["username"] = "?medstaffID=" + username;
		object["url"] = object["baseURL"] + object["username"];
		getUsers(object["url"]);
	}
	MashupPlatform.wiring.registerCallback("medstaffID", getMedicalStaff);
	

	// call web service from widget
	var handleTrigger = function handleTrigger(input){
		if (input == "1"){				
			getUsers(object["url"]);
		}
	}
	MashupPlatform.wiring.registerCallback("trigger", handleTrigger);	
});


function getUsers(url) {
	// ajax request
	MashupPlatform.http.makeRequest( url, {
		method: 'GET',
		forceProxy: true,
		requestHeaders: {"Accept": "application/json"},
		onSuccess: function(input) {
			if (debug) {
				console.log(input);
			}

			MashupPlatform.operator.log("Data were fetched.", MashupPlatform.log.INFO);

			var data = input["response"];		
			var response = JSON.parse(data);
			if (debug) {
				console.log(response); //--> ok
				console.log(response.response.users); // --> list
			}

			var list = response.response.users;

			// push list as string view
			MashupPlatform.wiring.pushEvent("users", list);
		},
		onFailure: function() {
			MashupPlatform.operator.log("Data were not fetched.", MashupPlatform.log.WARN);
			MashupPlatform.wiring.pushEvent("users", "-1");
		}
	});
}
