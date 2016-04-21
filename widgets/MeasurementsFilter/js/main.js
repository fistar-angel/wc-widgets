"use strict";


//**************************
// 	Global variables
//**************************
var debug = 0;
var global = {baseURL: null, username: null, url: null}

var getURL = function getURL(baseURL){
	global["baseURL"] = baseURL;
}
MashupPlatform.wiring.registerCallback("url", getURL);

var getMedicalStaff = function getMedicalStaff(username){
	global["username"] = "?medstaffID=" + username;
}
MashupPlatform.wiring.registerCallback("medstaffID", getMedicalStaff);


//**************************
// 	Ready document actions
//**************************
$(document).ready(function(){
	// local variables
	var widgetID = MashupPlatform.widget.id;

	//**************************
	// Get a list of biological parameters
	//**************************
    var getList = function getList(input){		
		var output = '<option value="-1" disabled="disabled" selected="selected">Select a biological parameter...</option>';
		for (var i in input) {
			output += "<option value='" + input[i].id.toString() + "'>";
			output += input[i].name.toString();
			output += "</option>";
		}

		if (input !== "-1"){
			$('#select_param option').each(function() {
		        $(this).remove();
			});
        	$("#select_param").append(output.toString());
        }
    }
    MashupPlatform.wiring.registerCallback("parameters", getList);

	//**************************
	// Get a list of users
	//**************************
    var getUsers = function getUsers(list){
		var output = '<option value="-1" disabled="disabled" selected="selected">Select a patient from the list...</option>';
		for (var i in list) {
			output += "<option value='" + list[i].id.toString() + "'>";
			output += list[i].uid.toString();
			output += (list[i].name.toString() !== "" || list[i].surname.toString() !== "") ? " (" : "" ;
			output += (list[i].name.toString() !== "") ? list[i].name.toString() + " " : list[i].name.toString();
			output += list[i].surname.toString();
			output += (list[i].name.toString() !== "" || list[i].surname.toString() !== "") ? ")" : "";
			output += "</option>";
		}

		if (list != "-1"){
			$('#select_user option').each(function() {
		        $(this).remove();
			});
        	$("#select_user").append(output.toString());
        }
    }
    MashupPlatform.wiring.registerCallback("users", getUsers);

	//**************************
	//	Define date thresholds
	//**************************
	// If the user clicks on the start date field, a pop-up window is displayed
	$('#from_date').datepicker({
		format: "yyyy/mm/dd",
		todayBtn: "linked",
		autoclose: true,
		todayHighlight: true
	});	

	// If the user clicks on the end date field, a pop-up window is displayed
	$('#until_date').datepicker({
		format: "yyyy/mm/dd",
		todayBtn: "linked",
		autoclose: true,
		todayHighlight: true
	});

	var handleTrigger = function handleTrigger(flag){
		if (flag == "1"){
			$( "#submit_button" ).trigger( "click" );
		}
	}
	MashupPlatform.wiring.registerCallback("refresh", handleTrigger);

});


//**************************
//	Catch the click event
//**************************
$(document).on("click","#submit_button", function(){

	$("#submit_button").find("span").removeClass("fa-search").addClass("fa-spinner fa-spin fa-lg disabled");

	// declare local JS object
	var object = {user: $("#select_user").val(), parameter: $("#select_param").val(), start: $("#from_date").val(), end: $("#until_date").val()}

	// validate user input
	var state = validation(object); 

	// Handle invalid data
	if (state === 0){
		//alert("No valid user input. Please check the selected dates or select a biologic parameter!");
		MashupPlatform.widget.log("No valid user input!", MashupPlatform.log.WARN);
	}
	else if (state === 1){
		// Sends a trigger event through the wiring.
		MashupPlatform.wiring.pushEvent("userID", object["user"]);
		MashupPlatform.wiring.pushEvent("paramType", object["parameter"]);
		MashupPlatform.wiring.pushEvent("startDate", object["start"]);
		MashupPlatform.wiring.pushEvent("endDate", object["end"]);
		MashupPlatform.widget.log("iWidget submit data successfully.", MashupPlatform.log.INFO);

		// logs
		if (debug){
			console.log("selected parameter: " + object["parameter"]);
			console.log("(" + object["start"] + " until " +  object["end"] + ")");
		}
	}

	$("#submit_button").find("span").removeClass("fa-spinner fa-spin disabled").addClass("fa-search");
});


$(document).on("click","#download_button", function(){
	// declare local JS object
	var object = {user: $("#select_user").val(), parameter: $("#select_param").val(), start: $("#from_date").val(), end: $("#until_date").val()}
	// validate user input
	var state = validation(object); 
	// url
	global['url'] = global['baseURL'] + "/users/" + object['user'] + "/measurements/" + object['parameter'];
	global['url'] += '/' + object["start"] + '/' + object["end"] + '/' + global["username"];
	// Handle invalid data
	if (state === 0){
		//alert("No valid user input. Please check the selected dates or select a biologic parameter!");
		MashupPlatform.widget.log("The creation of file is not possible due to invalid user input.", MashupPlatform.log.WARN);
		return ;
	}

	// set file name
	var id = $("#select_user").find('option:selected').text().split(" ");
	var filename = id[0] + '_' + $("#select_param").find('option:selected').text();
	filename += '_' + object.start + '_' + object.end;
	filename = filename.replace('-','');
	filename += '.csv';

	// ajax  & web service call
	MashupPlatform.http.makeRequest( global['url'], {
		method: 'GET',
		requestHeaders: {"Accept": "application/json"},
		onSuccess: function(input) {
			if (input["status"] === 200) {
				var data = input["response"];
				var response = JSON.parse(data);
				json2csv(response.response.measurements, filename);
			}
		},
		onFailure: function() {
			alert("The file is not completed due to an error!");
		}
	});
});


function json2csv(measurements, filename){
    var CSV = '';
    var header = "Value,Unit,Date/time";	

    //append Label row with line break
    CSV += header + '\r\n';

    for (var i in measurements) {
    	CSV += measurements[i].value.toString() + ',';
    	CSV += measurements[i].unit.toString() + ',';
    	CSV += measurements[i].timestamp.toString();
    	CSV += '\r\n';
    }

    if (CSV == '') {        
        alert("Invalid data");
        return;
    }

    //Initialize file format you want csv or xls
    var uri = 'data:text/csv;charset=utf-8,' + escape(CSV); 
    //this trick will generate a temp <a /> tag
    var link = document.createElement("a");    
    link.href = uri;
    //set the visibility hidden so it will not effect on your web-layout
    link.style = "visibility:hidden";
    link.download = filename;
    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}




//**************************
//	Validate user input
//**************************
function validation(input){
	// user
	var usr = validateUserSelection(input["user"])
	// params
	var prm = validateBiologicParameter(input["parameter"])
	// dates
	var dt = validateDates(input["start"], input["end"]);

	// logical AND
	return usr * prm * dt;
}


//**************************
//	Check the selected biologic parameter
//**************************
function validateUserSelection(userID){
	if (userID < 1 || isNaN(userID) ){
		$("#select_user").parent().addClass("has-error");
		return 0;
	}
	$("#select_user").parent().removeClass("has-error");
	return 1;
}

//**************************
//	Check the selected biologic parameter
//**************************
function validateBiologicParameter(parameter){
	if (parameter < 1 || isNaN(parameter) ){
		$("#select_param").parent().addClass("has-error");
		return 0;
	}
	$("#select_param").parent().removeClass("has-error");
	return 1;
}


//**************************
//	Check the selected dates
//**************************
function validateDates(start, end){
	if (start === "" || start === null){
		$("#from_date").parent().addClass("has-error");
	}
	if (end === "" || end === null){
		$("#until_date").parent().addClass("has-error");
		return 0;
	}
	if (parseDate(start) > parseDate(end)){
		$("#from_date").parent().addClass("has-error");
		$("#until_date").parent().addClass("has-error");
		return 0;
	}
	$("#from_date").parent().removeClass("has-error");
	$("#until_date").parent().removeClass("has-error");
	return 1;
}


//**************************
//	Parse the date in a appropriate format
//**************************
function parseDate(strDate) {
    var retval = new Date();
    var splitDate = strDate.split("/");
    retval.setFullYear(splitDate[0]);
    retval.setMonth(splitDate[1]-1);
    retval.setDate(splitDate[2]);
    retval.setHours(23,59,59);
    return retval;
}
