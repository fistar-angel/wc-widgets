"use strict";

//***********************
//	Global variables
//***********************
var debug = 0;


//***********************
//	 Ready document
//***********************
$(document).ready(function(){
	console.log("Operator #3 is loading")

	// callback function
	var handleData = function handleData(input){
		if (debug) {
			console.log(input);
		}

		// declare object
		var output = {title: null, label: null, unit: null, data: null, min: 10000, max: -10000};

		// On success http request 
		//if (input["status"] === 200 && input["statusText"] === "OK") {
		if (input["status"] === 200) {
			
			var data = input["response"];
			var response = JSON.parse(data);
			if (debug) {
				console.log(response); //--> ok
				console.log(response.response.measurements); // --> list
			}

			var measurements = response.response.measurements;
			var plot = [];

			// Run through the dataset and create a object per timestamp
			for (var i in measurements) {
				// define empty array
				var temp = [];	
				
				// get label and unit
				output["label"] = measurements[i].biological_parameter_name;
				output["unit"] = measurements[i].unit;
				
				// get measurement value and timestamp and declare an array
				temp.push(getDate(measurements[i].timestamp).toString());
				temp.push(measurements[i].value.toString());

				// keep maximum value
				if (measurements[i].value > output["max"]){
					output["max"] = measurements[i].value;
				}

				// keep minimum value
				if (measurements[i].value < output["min"]){
					output["min"] = measurements[i].value;
				}

				// plot is an array of arrays
				plot.push(temp);
			}

			output["min"] = Math.floor(output["min"]*9/10);
			output["max"] = Math.ceil(output["max"]*11/10);
			
			output["data"] = plot;	

			if (debug){
				console.log(output["data"]);
			}
		}
		else {
			output["data"] = "[[]]";
		}
		
		// predefined title of JQplot graph
		output["title"] = "Measurements preview";
		trigger(output);
	}

	// catch input
	MashupPlatform.wiring.registerCallback("retrievedData", handleData);

});


//***********************
//	Convert the datetime to a specific format yyyy-MM-dd hh:mm:ss
//***********************
function getDate(datetime){
	var date = new Date(datetime);
	var yr = date.getFullYear();
	var mo = date.getMonth() + 1;
	var day = date.getDate();

	var hours = date.getHours();
	var hr = hours < 10 ? '0' + hours : hours;

	var minutes = date.getMinutes();
	var min = (minutes < 10) ? '0' + minutes : minutes;

	var seconds = date.getSeconds();
	var sec = (seconds < 10) ? '0' + seconds : seconds;

	var newDateString = yr + '-' + mo  + '-' + day;
	var newTimeString = hr + ':' + min + ':' + sec;

	return newDateString + " " + newTimeString;
}


//***********************
//	Handle the trigger
//***********************
function trigger(object){
	if (debug){
		console.log(object);
	}

	MashupPlatform.wiring.pushEvent("title", object["title"]);
	MashupPlatform.wiring.pushEvent("label", object["label"]);
	MashupPlatform.wiring.pushEvent("unit", object["unit"]);
	MashupPlatform.wiring.pushEvent("min", object["min"]);
	MashupPlatform.wiring.pushEvent("max", object["max"]);
	MashupPlatform.wiring.pushEvent("measurements", object["data"]);
};
