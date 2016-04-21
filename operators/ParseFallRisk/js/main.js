"use strict";

//***********************
//	Global variables
//***********************
var debug = 0;


//***********************
//	 Ready document
//***********************
$(document).ready(function(){
	// callback function
	var handleData = function handleData(input){
		// debug
		console.log(input);

		// declare object
		var output = {title: null, data: null};

		// On success http request 
		if (input["status"] === 200) {
			
			var data = input["response"];
			var response = JSON.parse(data);

			var risk = response.response.risk;
			var plot = [];

			// Run through the risk instances and create a object per timestamp
			for (var i in risk) {
				// define empty array
				var temp = [];	
				
				// get measurement value and timestamp and declare an array
				temp.push(risk[i].timestamp.toString());
				//temp.push(risk[i].risk.toString());
				temp.push(risk[i].value.toString());

				// plot is an array of arrays
				plot.push(temp);
			}
			
			output["data"] = plot;	
		}
		else {
			output["data"] = "[[]]";
		}
		
		// predefined title of JQplot graph
		output["title"] = "Falling risk";
		trigger(output);
		// debug
		console.log(output);
	}

	// catch input
	MashupPlatform.wiring.registerCallback("fallRiskData", handleData);
});


//***********************
//	Handle the trigger
//***********************
function trigger(object){
	MashupPlatform.wiring.pushEvent("title", object["title"]);
	MashupPlatform.wiring.pushEvent("fallRiskInstances", object["data"]);
};
