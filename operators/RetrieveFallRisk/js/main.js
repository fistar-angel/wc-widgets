"use strict";

//***********************
//	Global variables
//***********************
var debug = 0;
var object = {user: null, parameter: null, risk: 0, startDate: null, endDate: null};
var global = {baseURL: null, username: null, url: null};

var getURL = function getURL(baseURL){
	global["baseURL"] = baseURL + "/users/";
}
MashupPlatform.wiring.registerCallback("url", getURL);

var getMedicalStaff = function getMedicalStaff(username){
	global["username"] = "&medstaffID=" + username;
}
MashupPlatform.wiring.registerCallback("medstaffID", getMedicalStaff);


//***********************
//	 Ready document
//***********************
$(document).ready(function(){

	var handleUser = function handleUser(input){
		object["user"] = input;
	}

	var handleParameter = function handleParameter(input){
		object["parameter"] = input;
	}

	var handleFallRisk = function handleFallRisk(input){
		object["risk"] = input;
	}

	var handleFromDate = function handleFromDate(input2){
		object["startDate"] = input2;
	}

	var handleEndDate = function handleEndDate(input3){
		object["endDate"] = input3;	
		trigger(object);
	}

	// catch the input from Measurement Filter widget
	MashupPlatform.wiring.registerCallback("userID", handleUser);
	MashupPlatform.wiring.registerCallback("paramID", handleParameter);
	MashupPlatform.wiring.registerCallback("risk", handleFallRisk);
	MashupPlatform.wiring.registerCallback("startDate", handleFromDate);
	MashupPlatform.wiring.registerCallback("endDate", handleEndDate);

});


//***********************
//	Handle the trigger
//***********************
function trigger(object){

	global["url"] = global["baseURL"] + object.user;
	global["url"] += "/biologic_parameter/" + object.parameter;
	global["url"] += "/risk" + "/" + object.startDate + "/" + object.endDate;
	global["url"] += "/?threshold=" + object.risk;
	global["url"] += global["username"];

	// AJAX request via REST API
	MashupPlatform.http.makeRequest( global["url"], {
		method: 'GET',
		requestHeaders: {"Accept": "application/json"},
		onSuccess: function(data) {
			MashupPlatform.wiring.pushEvent("retrievedRisk", data);
		},
		onFailure: function(response) {
			MashupPlatform.wiring.pushEvent("retrievedRisk", "");
		}
	});

	object["risk"] = null;
}
