"use strict";


//**************************
// 	Global variables
//**************************
var debug = 0;
var url = null;
var global = {baseURL: null, url: null}

var getURL = function getURL(baseURL){
	global["baseURL"] = baseURL + "/biologic_parameters";
}
MashupPlatform.wiring.registerCallback("url", getURL);


//**************************
// 	Ready document actions
//**************************
$(document).ready(function(){
	// local variables
	var widgetID = MashupPlatform.widget.id;

	// clean in case of refresh
    if ($(document).find("#parameters_container").length){
        $(document).find("#parameters_container").remove();
    }

    $(document).find("#refresh-parameters-btn > span").removeClass("fa-spinner fa-spin disabled").addClass("fa-refresh");

	//**************************
	// Get a list of biologic parameters
	//**************************
    var getParameters = function getParameters(list){
		var output = "<div id='parameters_container'>" + 
			"<table class='table table_fill table-hover table-striped table-bordered'>" + 
				"<thead>"+
					"<tr class='table_line success'>"+
						"<th><center>#</center></th>"+
						"<th><center>Name</center></th>"+
						"<th><center>Description</center></th>"+
						"<th><center>Unit</center></th>"+
						"<th><center>Edit</center></th>" + 
						"<th><center>Delete</center></th>" + 
					"</tr>" +							
				"</thead>"+
				"<tbody>";

		var counter = 0;
		for (var i in list){
			if (debug) {
				console.info(list[i]);
			}
			counter++;
			output += "<tr>" +
						"<td><center>" + counter + "</center></td>" + 
						"<td><center>" + list[i].name.toString() + "</center></td>"+
						"<td><center>" + ((list[i].type === null) ? "-" : list[i].type.toString()) + "</center></td>"+
						"<td><center>" + list[i].unit.toString() + "</center></td>"+
						"<td><center>" +
	               			"<button type='button' class='btn btn-primary btn-xs' id='edit-parameter-btn' name='edit_parameter_btn' title='edit' value='"+ list[i].id +"'>" +
	                    		"<span class='glyphicon glyphicon-pencil'></span>" +
	        				"</button>" +
	                	"</center></td>" +
	                	"<td><center>" +
	                		"<button type='button' class='btn btn-danger btn-xs' id='delete-parameter-btn' name='delete_parameter_btn' title='delete' value='"+ list[i].id +"'>" +
	                    		"<span class='glyphicon glyphicon-trash'></span>" +
	                		"</button>" +
	            		"</center></td>" +
					"</tr>";
		}
		output += "</tbody></table></div>";

		// clean in case of refresh
	    if ($(document).find("#parameters_container").length){
	        $(document).find("#parameters_container").remove();
	    }

		// append table
		$(document).find("#parameters_table").append(output);

		$(document).find("#refresh-parameters-btn > span").removeClass("fa-spinner fa-spin disabled").addClass("fa-refresh");

    }
    MashupPlatform.wiring.registerCallback("biologic_parameters", getParameters);
});


$(document).on("click", "#add-parameter-btn", function(){	
	displayForm();

	// replace text of form
	$(".parameter_action").text("Add parameter");
	$(document).find("#replace_new_parameter").attr("id", "submit_new_parameter").removeAttr("replace_new_parameter");
});


$(document).on("click", "#edit-parameter-btn", function(){
	// URL
	url = global["baseURL"] + '/' + $(this).val();

	// replace text of form
	$(".parameter_action").text("Edit parameter");
	$(document).find("#submit_new_parameter").attr("id", "replace_new_parameter").removeAttr("submit_new_parameter");

	// display form
	displayForm();

	// ajax  & web service call
	MashupPlatform.http.makeRequest( url, {
		method: 'GET',
		requestHeaders: {"Accept": "application/json"},
		onSuccess: function(input) {
			var data = input["response"];		
			var response = JSON.parse(data);
			var parameter = response.response.biologic_parameter;			

			// fill in the form
	        $(document).find("#parameter_name").attr("value", parameter.name);
	        $(document).find("#parameter_type").attr("value", parameter.type);
	        $(document).find("#parameter_unit").attr("value", parameter.unit);
		},
		onFailure: function() {
			alert("AN error occured during the biologic parameter retrieval!");
		}
	});
	
});


$(document).on("click", "#delete-parameter-btn", function(){
	var url = global["baseURL"] + '/' + $(this).val();

	MashupPlatform.http.makeRequest( url, {
		method: 'DELETE',
		requestHeaders: {"Accept": "application/json"},
		onSuccess: function() {
			reloadTable();
		},
		onFailure: function() {
			alert("Oops. An error was occured!!!");
		}
	});
});


$(document).on("click", "#refresh-parameters-btn", function(){
	$(this).find("span").removeClass("fa-refresh").addClass("fa-spinner fa-spin disabled");
	reloadTable();
});


function reloadTable(){
	MashupPlatform.wiring.pushEvent("reload", 1);
}


$(document).on("click", "#close-add-parameter-form-btn", function(){
	closeForm();
});


function displayForm(){
	$(document).find("#add-parameter-form").addClass("col-sm-4").removeClass("hidden col-sm-0");
	$(document).find("#parameters-list").addClass("col-sm-8").removeClass("col-sm-12");

	resetForm();
}


function closeForm(){
	$(document).find("#add-parameter-form").removeClass("col-sm-4").addClass("hidden col-sm-0");
	$(document).find("#parameters-list").removeClass("col-sm-8").addClass("col-sm-12");	

	resetForm();
}


function resetForm(){
	// reset form
    $(document).find("#parameter_name").attr("value", "");
    $(document).find("#parameter_type").attr("value", "");
    $(document).find("#parameter_unit").attr("value", "");

    $("#parameter_name").parent().removeClass("has-error");
    $("#parameter_type").parent().removeClass("has-error");
    $("#parameter_unit").parent().removeClass("has-error");
}


$(document).on("click", "#submit_new_parameter", function(){
	var type = ($("#parameter_type").val() == "") ? null : $("#parameter_type").val(); 
	//pattern
    var object = {
    	name: $("#parameter_name").val(),
        type: type,
        unit: $("#parameter_unit").val(),
    };

    if ( !validation() ){
    	return false;
    }

	var url = global["baseURL"];

	// ajax request
	MashupPlatform.http.makeRequest( url, {
		method: 'POST',
		contentType: "application/json",
		forceProxy: true,
		requestHeaders: {"Content-Type": "application/json", "Accept": "application/json"},
		parameters: JSON.stringify(object),
		onSuccess: function(input) {
			console.log("Insert new biologic parameter successfully.");
		},
		onFailure: function() {
			alert("Oops!!! An error was ocurred");
		}
	});

	closeForm();
	setTimeout(function() {
    	reloadTable();
	}, 800);


	resetForm();
	return false;
});


$(document).on("click", "#replace_new_parameter", function(){
	var type = ($("#parameter_type").val() == "") ? null : $("#parameter_type").val(); 
	//pattern
    var object = {
    	name: $("#parameter_name").val(),
        type: type,
        unit: $("#parameter_unit").val(),
    };

    if ( !validation() ){
    	return false;
    }

	// ajax request
	MashupPlatform.http.makeRequest( url, {
		method: 'PUT',
		contentType: "application/json",
		forceProxy: true,
		requestHeaders: {"Content-Type": "application/json", "Accept": "application/json"},
		parameters: JSON.stringify(object),
		onSuccess: function(input) {
			console.log("Update a biologic parameter successfully.");
		},
		onFailure: function() {
			alert("Oops!!! An error was ocurred");
		}
	});

	closeForm();
	setTimeout(function() {
    	reloadTable();
	}, 800);

	resetForm();
	return false;
});


// Form validation
function validation(){
	var name = validateName($("#parameter_name"));
	var type = validateType($("#parameter_type"));
	var unit = validateUnit($("#parameter_unit"));

	// logical AND
	return (name && type && unit);
}

// Validate name
function validateName(name){
    var regex = /^([a-zA-Z ]+)$/;
    if (!regex.test(name.val())) {
        name.parent().addClass("has-error");
        return false;
    }
    name.parent().removeClass("has-error");
    return true;
}

// Validate type/description
function validateType(description){
	var regex = /^([a-zA-Z0-9'\- ]+)$/;
	if ( description.val().length > 0 ){
		if (!regex.test(description.val()) ) {
			description.parent().addClass("has-error");
	        return false;
		}
	}
    description.parent().removeClass("has-error");
    return true;
}

// Validate unit
function validateUnit(unit){
	if (!unit.val().length) {
		unit.parent().addClass("has-error");
        return false;
	}
    unit.parent().removeClass("has-error");
    return true;
}