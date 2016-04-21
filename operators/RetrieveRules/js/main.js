"use strict";

//***********************
//	Global variables
//***********************
var debug = 0;
var object = {baseURL: null, url: null}


//***********************
//	 Ready document
//***********************
$(document).ready(function() {
	console.log("Operator #4 is loading");

	var getURL = function getURL(baseURL){
		object["baseURL"] = baseURL;
		object["url"] = object["baseURL"] + "/rules";
		getRules(object["url"]);
	}
	MashupPlatform.wiring.registerCallback("url", getURL);


	var handleTrigger = function handleTrigger(input){
		if (input == "1"){
			getRules(object["url"]);
		}
	}
	// call web service from widget
	MashupPlatform.wiring.registerCallback("trigger", handleTrigger);
});


function getRules(url){
	// ajax request
	MashupPlatform.http.makeRequest( url, {
		method: 'GET',
		forceProxy: true,
		requestHeaders: {"Accept": "application/json"},
		onSuccess: function(input) {
			MashupPlatform.operator.log("Data were fetched.", MashupPlatform.log.INFO);

			var data = input["response"];		
			var response = JSON.parse(data);
			var list = response.response.rules;

			// push list as string view
			MashupPlatform.wiring.pushEvent("rules_list", list);
		},
		onFailure: function() {
			MashupPlatform.operator.log("Data were not fetched.", MashupPlatform.log.WARN);
			MashupPlatform.wiring.pushEvent("rules_list", "-1");
		}
	});
}
