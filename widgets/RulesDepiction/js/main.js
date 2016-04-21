"use strict";


//**************************
// 	Global variables
//**************************
var debug = 0;
var url = null;
var global = {baseURL: null, username: null, url: null};

var getURL = function getURL(baseURL){
	global["baseURL"] = baseURL;
	global["url"] = global['baseURL'] + "/rules";
}
MashupPlatform.wiring.registerCallback("url", getURL);


//**************************
// 	Ready document actions
//**************************
$(document).ready(function(){
	// local variables
	var widgetID = MashupPlatform.widget.id;

	// clean in case of refresh
    if ($(document).find("#rules_container").length){
        $(document).find("#rules_container").remove();
    }

    $(document).find("#refresh-rules-btn > span").removeClass("fa-spinner fa-spin disabled").addClass("fa-refresh");

	//**************************
	// Get a list of rules
	//**************************
    var getRules = function getRules(list){

		var output = "<div id='rules_container'>" + 
					"<table class='table table_fill table-hover table-striped table-bordered'>" + 
						"<thead>"+
							"<tr class='table_line success'>"+
								"<th rowspan=2><center>#</center></th>"+
								"<th rowspan=2>Parameter (unit)</th>"+
								"<th rowspan=2><center>Optimal value</center></th>"+
								"<th colspan=2><center>Normal thresholds</center></th>"+
								"<th colspan=2><center>Acceptable thresholds</center></th>"+
								"<th rowspan=2><center>Edit</center></th>" + 
								"<th rowspan=2><center>Delete</center></th>" + 
							"</tr>" +							
							"<tr class='table_line success'>"+
								"<th><center>Low</center></th>"+
								"<th><center>High</center></th>"+
								"<th><center>Low</center></th>"+
								"<th><center>High</center></th>"+
							"</tr>" +
						"</thead>"+
						"<tbody>";
		var counter = 0;
		for (var i in list){
			counter++;
			output += "<tr>" +
						"<td><center>" + counter + "</center></td>" + 
						"<td>" + list[i].biological_parameter_name.toString() + " (" + list[i].unit.toString() +")</td>"+
						"<td><center>" + ((list[i].optimal_value === null) ?  " - " :  list[i].optimal_value.toString() ) + "</center></td>"+
						"<td><center>" + ((list[i].normal_low_threshold === null) ?  " - " :  list[i].normal_low_threshold.toString() ) + "</center></td>"+
						"<td><center>" +  ((list[i].normal_high_threshold === null) ?  " - " :  list[i].normal_high_threshold.toString() ) + "</center></td>"+
						"<td><center>" + ((list[i].acceptable_low_threshold === null) ?  " - " :  list[i].acceptable_low_threshold.toString() ) + "</center></td>"+
						"<td><center>" +  ((list[i].acceptable_high_threshold === null) ?  " - " :  list[i].acceptable_high_threshold.toString() ) + "</center></td>"+
						"<td><center>" +
                   			"<button type='button' class='btn btn-primary btn-xs' id='edit-btn' name='edit_btn' title='edit' value='"+ list[i].id +"'>" +
                        		"<span class='glyphicon glyphicon-pencil'></span>" +
            				"</button>" +
                    	"</center></td>" +
                    	"<td><center>" +
                    		"<button type='button' class='btn btn-danger btn-xs' id='delete-btn' name='delete_btn' title='delete' value='"+ list[i].id +"'>" +
                        		"<span class='glyphicon glyphicon-trash'></span>" +
                    		"</button>" +
                		"</center></td>" +
					"</tr>";

		}
		output += "</tbody></table></div>";

		// clean in case of refresh
	    if ($(document).find("#rules_container").length){
	        $(document).find("#rules_container").remove();
	    }

		// append table
    	$("#rules_table").append(output);

    	$(document).find("#refresh-rules-btn > span").removeClass("fa-spinner fa-spin disabled").addClass("fa-refresh");

    }
    MashupPlatform.wiring.registerCallback("rules", getRules);


	//**************************
	// Get a list of biological parameters in case of addition
	//**************************
    var getList = function getList(input){		
		var output = '<option value="-1" disabled="disabled" selected="selected">Select a biological parameter...</option>';
		for (var i in input) {
			output += "<option value='" + input[i].id.toString() + "'>";
			output += input[i].name.toString();
			output += "</option>";
		}

		if (input !== "-1"){
			$('#add_rule_parameter option').each(function() {
		        $(this).remove();
			});
        	$("#add_rule_parameter").append(output.toString());
        }
    }
    MashupPlatform.wiring.registerCallback("parameters", getList);
});


$(document).on("click", "#add-rule-btn", function(){	
	displayForm();

	// replace text of form
	$(".rule_action").text("Add rule");
	$(document).find("#replace_new_rule").attr("id", "submit_new_rule").removeAttr("replace_new_rule");
});


$(document).on("click", "#edit-btn", function(){
	url = global["url"] + '/' + $(this).val();

	// replace text of form
	$(".rule_action").text("Edit rule");
	$(document).find("#submit_new_rule").attr("id", "replace_new_rule").removeAttr("submit_new_rule");

	// display form
	displayForm();

	// ajax  & web service call
	MashupPlatform.http.makeRequest( url, {
		method: 'GET',
		requestHeaders: {"Accept": "application/json"},
		onSuccess: function(input) {
			var data = input["response"];		
			var response = JSON.parse(data);
			var rule = response.response.rule[0];			
			if (debug) {
				console.log(rule[0]);
			}

			// fill in the form
	        $(document).find('select[name=add_rule_parameter]').val( rule.biological_parameter_id );
	        $(document).find("#add_rule_optimal").attr("value", rule.optimal_value);
	        $(document).find("#add_rule_accept_low").attr("value", rule.normal_low_threshold);
	        $(document).find("#add_rule_accept_high").attr("value", rule.normal_high_threshold);
	        $(document).find("#add_rule_critical_low").attr("value", rule.acceptable_low_threshold);
	        $(document).find("#add_rule_critical_high").attr("value", rule.acceptable_high_threshold);
		},
		onFailure: function() {
			alert("The retrieval of the selected rule failed due to an error!");
		}
	});
	
});


$(document).on("click", "#delete-btn", function(){
	var url = global["url"] + '/' + $(this).val();

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


$(document).on("click", "#refresh-rules-btn", function(){
	$(this).find("span").removeClass("fa-refresh").addClass("fa-spinner fa-spin disabled");
	reloadTable();
});


function reloadTable(){
	MashupPlatform.wiring.pushEvent("reload", 1);
}


$(document).on("click", "#close-add-rule-form-btn", function(){
	closeForm();
});


function displayForm(){
	$(document).find("#add-rule-form").addClass("col-sm-4").removeClass("hidden col-sm-0");
	$(document).find("#rules-list").addClass("col-sm-8").removeClass("col-sm-12");

	resetForm();
}


function closeForm(){
	$(document).find("#add-rule-form").removeClass("col-sm-4").addClass("hidden col-sm-0");
	$(document).find("#rules-list").removeClass("col-sm-8").addClass("col-sm-12");	

	resetForm();
}


function resetForm(){
	// reset form
    $(document).find('select[name=add_rule_parameter]').val(-1);
    $(document).find("#add_rule_optimal").attr("value", "");
    $(document).find("#add_rule_accept_low").attr("value", "");
    $(document).find("#add_rule_accept_high").attr("value", "");
    $(document).find("#add_rule_critical_low").attr("value", "");
    $(document).find("#add_rule_critical_high").attr("value", "");

	$("#add_rule_parameter").parent().removeClass("has-error");
    $("#add_rule_optimal").parent().removeClass("has-error");
    $("#add_rule_accept_low").parent().removeClass("has-error");
    $("#add_rule_accept_high").parent().removeClass("has-error");
    $("#add_rule_critical_low").parent().removeClass("has-error");
    $("#add_rule_critical_high").parent().removeClass("has-error");
}



$(document).on("click", "#submit_new_rule", function(){

	var normal_low_threshold = ( $("#add_rule_accept_low").val() == "") ? null :  $("#add_rule_accept_low").val();
	var normal_high_threshold = ( $("#add_rule_accept_high").val() == "") ? null :  $("#add_rule_accept_high").val(); 
	var url = global["url"];

	if ( !validation() ) {
		return false;
	}

	//pattern
    var object = {
        biological_parameter_id: $("#add_rule_parameter").val(),
        optimal_value: $("#add_rule_optimal").val(),
        normal_low_threshold: normal_low_threshold,
        normal_high_threshold: normal_low_threshold,
        acceptable_low_threshold: $("#add_rule_critical_low").val(),
        acceptable_high_threshold: $("#add_rule_critical_high").val(),
    };



	// ajax request
	MashupPlatform.http.makeRequest( url, {
		method: 'POST',
		contentType: "application/json",
		forceProxy: true,
		requestHeaders: {"Content-Type": "application/json", "Accept": "application/json"},
		parameters: JSON.stringify(object),
		onSuccess: function(input) {
			console.log("Insert a new rule successfully.");
		},
		onFailure: function() {
			alert("The registration of the new rule failed due to an error!");
		}
	});

	resetForm();
	closeForm();
	setTimeout(function() {
    	reloadTable();
	}, 800);
	
	return false;
});


$(document).on("click", "#replace_new_rule", function(){
	
	var normal_low_threshold = ( $("#add_rule_accept_low").val() == "") ? null :  $("#add_rule_accept_low").val();
	var normal_high_threshold = ( $("#add_rule_accept_high").val() == "") ? null :  $("#add_rule_accept_high").val(); 

	if ( !validation() ) {
		return false;
	}

	//pattern
    var object = {
        biological_parameter_id: $("#add_rule_parameter").val(),
        optimal_value: $("#add_rule_optimal").val(),
        normal_low_threshold: normal_low_threshold,
        normal_high_threshold: normal_high_threshold,
        acceptable_low_threshold: $("#add_rule_critical_low").val(),
        acceptable_high_threshold: $("#add_rule_critical_high").val(),
    };

	// ajax request
	MashupPlatform.http.makeRequest( url, {
		method: 'PUT',
		contentType: "application/json",
		forceProxy: true,
		requestHeaders: {"Content-Type": "application/json", "Accept": "application/json"},
		parameters: JSON.stringify(object),
		onSuccess: function(input) {
			console.log("Update a rule successfully.");
		},
		onFailure: function() {
			alert("The modification of the existing rule failed due to an error!");
		}
	});

	resetForm();
	closeForm();
	setTimeout(function() {
    	reloadTable();
	}, 800);
	
	return false;
});


function validation(){
	var parameter = validateParameterField($("#add_rule_parameter"));
	var optVal = validateOptimalValueField($("#add_rule_optimal"));
	var nLow = validateNormalLowField($("#add_rule_accept_low"));
	var nHigh = validateNormalHighField($("#add_rule_accept_high"));
	var accLow = validateAcceptLowField($("#add_rule_critical_low"));
	var accHigh = validateAcceptHighField($("#add_rule_critical_high"));
	// logical AND operation
	return (parameter && optVal && accLow && accHigh && nLow && nHigh);
}

function validateParameterField(parameter){
    var regex = /^([0-9]+)$/;
    if (!regex.test(parameter.val())) {
        parameter.parent().addClass("has-error");
        return false;
    }
    parameter.parent().removeClass("has-error");
    return true;
}

function validateOptimalValueField(optimal){
    var regex = /^([-+]?[0-9]*\.?[0-9]*)$/;
    if (!regex.test(optimal.val()) || optimal.val().length < 1) {
        optimal.parent().addClass("has-error");
        return false;
    }
    optimal.parent().removeClass("has-error");
    return true;
}

function validateNormalLowField(low){
    var regex = /^([-+]?[0-9]*\.?[0-9]*)$/;
    if (low.val().length > 0){
	    if (!regex.test(low.val())) {
	        low.parent().addClass("has-error");
	        return false;
	    }
    }
    low.parent().removeClass("has-error");
    return true;
}

function validateNormalHighField(high){
    var regex = /^([-+]?[0-9]*\.?[0-9]*)$/;
    if (high.val().length > 0 ) {
	    if (!regex.test(high.val())) {
	        high.parent().addClass("has-error");
	        return false;
	    }
    }
    high.parent().removeClass("has-error");
    return true;
}

function validateAcceptLowField(low){
    var regex = /^([-+]?[0-9]*\.?[0-9]*)$/;
    if (!regex.test(low.val())) {
        low.parent().addClass("has-error");
        return false;
    }
    low.parent().removeClass("has-error");
    return true;
}

function validateAcceptHighField(high){
    var regex = /^([-+]?[0-9]*\.?[0-9]*)$/;
    if (!regex.test(high.val())) {
        high.parent().addClass("has-error");
        return false;
    }
    high.parent().removeClass("has-error");
    return true;

}