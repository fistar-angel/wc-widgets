"use strict";

//***********************
//	Global variables
//***********************
var debug = 0;
var object = {baseURL: null, url: null};


//***********************
//	 Ready document
//***********************
$(document).ready(function() {

	console.log("Operator #1 is loading");
	//var url = "http://"+ host + ":" + port + service;

	var getURL = function getURL(baseURL){
		object["baseURL"] = baseURL;
		object["url"] = object["baseURL"] + "/biologic_parameters";
		getBiologicParameters(object["url"]);
	}
	MashupPlatform.wiring.registerCallback("url", getURL);


	var handleTrigger = function handleTrigger(input){
		if (input == "1"){
			getBiologicParameters(object["url"]);
			return ;
		}
	}
	// call web service from widget
	MashupPlatform.wiring.registerCallback("trigger", handleTrigger);

	//getBiologicParameters(url);
});


function getBiologicParameters(url){
	// ajax request
	MashupPlatform.http.makeRequest( url, {
		method: 'GET',
		requestHeaders: {"Accept": "application/json"},
		onSuccess: function(input) {
			if (debug) {
				console.log(input);
			}

			MashupPlatform.operator.log("Data were fetched.", MashupPlatform.log.INFO);

			var data = input["response"];		
			var response = JSON.parse(data);
			var list = response.response.biologic_parameters;
			// push list as string view
			MashupPlatform.wiring.pushEvent("list", list);
		},
		onFailure: function() {
			MashupPlatform.operator.log("Data were not fetched.", MashupPlatform.log.WARN);
			MashupPlatform.wiring.pushEvent("list", "-1");
		}
	});
}
