"use strict";


//**************************
// 	Global variables
//**************************
var debug = 0;
var url = null;
var global = {baseURL: null, username: null, url: null}


var getURL = function getURL(baseURL){
	global["baseURL"] = baseURL + "/users";
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

	// clean in case of refresh
    if ($(document).find("#users_container").length){
        $(document).find("#users_container").remove();
    }

    $(document).find("#refresh-users-btn > span").removeClass("fa-spinner fa-spin disabled").addClass("fa-refresh");

	//**************************
	// Get a list of users
	//**************************
    var getUsers = function getUsers(list){
		var output = "<div id='users_container'>" + 
			"<table class='table table_fill table-hover table-striped table-bordered'>" + 
				"<thead>"+
					"<tr class='table_line success'>"+
						"<th><center>#</center></th>"+
						"<th><center>Name</center></th>"+
						"<th><center>Surname</center></th>"+
						"<th><center>User ID</center></th>"+
						"<th><center>Birth date</center></th>"+
						"<th><center>Email</center></th>"+
						"<th><center>Mobile</center></th>"+
						"<th><center>Timezone</center></th>"+
						"<th><center>registration</center></th>"+
						"<th><center>Edit</center></th>" + 
						"<th><center>Delete</center></th>" + 
					"</tr>" +							
				"</thead>"+
				"<tbody>";

		var counter = 0;
		for (var i in list){
			counter++;
			output += "<tr>" +
						"<td><center>" + counter + "</center></td>" + 
						"<td><center>" + list[i].name.toString() + "</center></td>"+
						"<td><center>" + list[i].surname.toString() + "</center></td>"+
						"<td><center>" + list[i].uid.toString() + "</center></td>"+
						"<td><center>" + list[i].birthdate.toString() + "</center></td>"+
						"<td><center>" + list[i].email.toString() + "</center></td>"+
						"<td><center>" + list[i].phone.toString() + "</center></td>"+
						"<td><center>" + list[i].timezone.toString() + "</center></td>"+
						"<td><center>" + list[i].registration.toString() + "</center></td>"+
						"<td><center>" +
	               			"<button type='button' class='btn btn-primary btn-xs' id='edit-user-btn' name='edit_user_btn' title='edit' value='"+ list[i].id +"'>" +
	                    		"<span class='glyphicon glyphicon-pencil'></span>" +
	        				"</button>" +
	                	"</center></td>" +
	                	"<td><center>" +
	                		"<button type='button' class='btn btn-danger btn-xs' id='delete-user-btn' name='delete_user_btn' title='delete' value='"+ list[i].id +"'>" +
	                    		"<span class='glyphicon glyphicon-trash'></span>" +
	                		"</button>" +
	            		"</center></td>" +
					"</tr>";
		}
		output += "</tbody></table></div>";

		// clean in case of refresh
	    if ($(document).find("#users_container").length){
	        $(document).find("#users_container").remove();
	    }

		// append table
		$(document).find("#users_table").append(output);

		$(document).find("#refresh-users-btn > span").removeClass("fa-spinner fa-spin disabled").addClass("fa-refresh");

    }
    MashupPlatform.wiring.registerCallback("users", getUsers);

    // birthdate selection 
	$('#user_birthdate').datepicker({
		format: "yyyy-mm-dd",
		todayBtn: "linked",
		autoclose: true,
		todayHighlight: true
	});
});


$(document).on("click", "#add-user-btn", function(){	
	displayForm();

	// replace text of form
	$(".user_action").text("Add user");
	$(document).find("#replace_new_user").attr("id", "submit_new_user").removeAttr("replace_new_user");

	$('#select_timezone option').each(function() {
        $(this).remove();
	});
	getTimezoneNames(null);
});


$(document).on("click", "#edit-user-btn", function(){
	// URL
	url = global["baseURL"] + '/' + $(this).val() + global["username"];

	// replace text of form
	$(".user_action").text("Edit user");
	$(document).find("#submit_new_user").attr("id", "replace_new_user").removeAttr("submit_new_user");

	// display form
	displayForm();

	// ajax  & web service call
	MashupPlatform.http.makeRequest( url, {
		method: 'GET',
		requestHeaders: {"Accept": "application/json"},
		onSuccess: function(input) {
			var data = input["response"];		
			var response = JSON.parse(data);
			var user = response.response.user;			

			// fill in the form
	        $(document).find("#user_name").attr("value", user.name);
	        $(document).find("#user_surname").attr("value", user.surname);
	        $(document).find("#user_uid").attr("value", user.uid);
	        $(document).find("#user_birthdate").attr("value", user.birthdate);
	        $(document).find("#user_email").attr("value", user.email);
	        $(document).find("#user_phone").attr("value", user.phone);
	        $(document).find("#user_profile").attr("value", user.profile);
	        $(document).find("#user_treatment").attr("value", user.treatment);
	        
	        // timezone list
        	$('#select_timezone option').each(function() {
        		$(this).remove();
			});
			getTimezoneNames(user.timezone);
		},
		onFailure: function() {
			alert("The retrieval of the selected user failed due to an error!");
		}
	});
	
});


$(document).on("click", "#delete-user-btn", function(){

	var url = global["baseURL"] + '/' +  $(this).val() + global["username"];

	MashupPlatform.http.makeRequest( url, {
		method: 'DELETE',
		requestHeaders: {"Accept": "application/json"},
		onSuccess: function() {
			reloadTable();
		},
		onFailure: function() {
			alert("The deletion of the selected user failed due to an error!");
		}
	});
});


$(document).on("click", "#refresh-users-btn", function(){
	$(this).find("span").removeClass("fa-refresh").addClass("fa-spinner fa-spin disabled");
	reloadTable();
});


function getTimezoneNames(selected){
	
	$.getJSON('https://cdn.rawgit.com/moment/moment-timezone/0d66f93d5ebdea7d2f0b76e842e08fbb07ac3229/data/packed/latest.json').then(function (data) {
		var list;
    	moment.tz.load(data);
    	var names = moment.tz.names();	
    	
    	if (selected === null) {
			list = '<option value="-1" disabled="disabled" selected="selected">Select a timezone name...</option>';
			for (var i in names) {
				list += "<option value='"+names[i]+"'>"+ names[i] + "</option>";
			}
		}
		else {
			list = '<option value="-1" disabled="disabled">Select a timezone name...</option>';
			for (var i in names) {
				list += (names[i].toString() === selected) ? "<option value='"+names[i]+"' selected='selected'>"+ names[i] + "</option>" : "<option value='"+names[i]+"'>"+ names[i] + "</option>";
			}
		}

		$("#user_timezone").append(list);
	});
}


function reloadTable(){
	MashupPlatform.wiring.pushEvent("reload", 1);
}


$(document).on("click", "#close-add-user-form-btn", function(){
	closeForm();
});


function displayForm(){
	$(document).find("#add-user-form").addClass("col-sm-4").removeClass("hidden col-sm-0");
	$(document).find("#users-list").addClass("col-sm-8").removeClass("col-sm-12");

	resetForm();
}


function closeForm(){
	$(document).find("#add-user-form").removeClass("col-sm-4").addClass("hidden col-sm-0");
	$(document).find("#users-list").removeClass("col-sm-8").addClass("col-sm-12");	

	resetForm();
}


function resetForm(){
	// reset form
    $(document).find("#user_name").attr("value", "");
    $(document).find("#user_surname").attr("value", "");
    $(document).find("#user_uid").attr("value", "");
    $(document).find("#user_birthdate").attr("value", "");
    $(document).find("#user_email").attr("value", "");
    $(document).find("#user_phone").attr("value", "");
    $(document).find("#user_profile").attr("value", "");
    $(document).find("#user_treatment").attr("value", "");
    $(document).find("#user_timezone").attr("value", "");

    $("#user_name").parent().removeClass("has-error");
    $("#user_surname").parent().removeClass("has-error");
    $("#user_profile").parent().removeClass("has-error");
    $("#user_treatment").parent().removeClass("has-error");
    $("#user_phone").parent().removeClass("has-error");
    $("#user_timezone").parent().removeClass("has-error");
    $("#user_birthdate").parent().removeClass("has-error");
    $("#user_uid").parent().removeClass("has-error");
    $("#user_email").parent().removeClass("has-error");
}


//function addRule(){
$(document).on("click", "#submit_new_user", function(){

	//pattern
    var object = {
    	name: $("#user_name").val(),
        surname: $("#user_surname").val(),
        uid: $("#user_uid").val(),
	    birthdate: $("#user_birthdate").val(),
	    email: $("#user_email").val(),
	    phone: $("#user_phone").val(),
	    profile: $("#user_profile").val(),
	    treatment: $("#user_treatment").val(),
	    timezone: $("#user_timezone").val(),
	    medstaffID: global["username"].replace("?medstaffID=",'')
    };

    // validate fields
    if (!validation()) {
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
			console.log("Insert new user successfully.");
		},
		onFailure: function() {
			alert("The registration of the selected user failed due to an error!");
		}
	});

	resetForm();
	closeForm();
	setTimeout(function() {
    	reloadTable();
	}, 800);
	
	return false;
});


$(document).on("click", "#replace_new_user", function(){
	//pattern
    var object = {
    	name: $("#user_name").val(),
        surname: $("#user_surname").val(),
        uid: $("#user_uid").val(),
	    birthdate: $("#user_birthdate").val(),
	    email: $("#user_email").val(),
	    phone: $("#user_phone").val(),
	    profile: $("#user_profile").val(),
	    treatment: $("#user_treatment").val(),
	    timezone: $("#user_timezone").val()
    };

    // validate fields
    if (!validation()) {
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
			console.log("Update new user successfully.");
		},
		onFailure: function() {
			alert("The modification of the selected user failed due to an error!");
		}
	});

	closeForm();
	resetForm();
	setTimeout(function() {
    	reloadTable();
	}, 800);
	
	return false;
});


// Form validation
function validation(){
	var name = (validateName($("#user_name")) && validateName($("#user_surname")));
	var profile = validateProfile($("#user_profile")) && validateTreatment($("#user_treatment"));
	var mail = validateMail($("#user_email"));
	var mobile = validateMobile($("#user_phone"));
	var timezone = validateTimezone($("#user_timezone"));
	var birthdate = validateBdate($("#user_birthdate"));
	var uid = validateUID($("#user_uid"));
	// logical AND
	return (name && profile && mail && mobile && timezone && birthdate && uid);
}

// Validate first and last name of patient
function validateName(name){
    var regex = /^([a-zA-Z'\- ]{3,50})$/;
    if (!regex.test(name.val())) {
        name.parent().addClass("has-error");
        return false;
    }
    name.parent().removeClass("has-error");
    return true;
}

// Validate profile
function validateProfile(profile){
	if (profile.val().length < 1 || profile.val().length > 300){
		profile.parent().addClass("has-error");
        return false;
	}
    profile.parent().removeClass("has-error");
    return true;
}

// Validate treatment
function validateTreatment(treatment){
	if (treatment.val().length < 1 || treatment.val().length > 300){
		treatment.parent().addClass("has-error");
        return false;
	}
    treatment.parent().removeClass("has-error");
    return true;
}

// Validate emial account
function validateMail(mail){
    var regex = /^(([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+)$/;
    if (!regex.test(mail.val())) {
        mail.parent().addClass("has-error");
        return false;
    }
    mail.parent().removeClass("has-error");
    return true;
}

// Validate mobile number
function validateMobile(mobile) {
    var regex = /^([0-9]{10,})$/;

    if (!regex.test(mobile.val())) {
        mobile.parent().addClass('has-error');
        return false;
    }
    mobile.parent().removeClass('has-error');
    return true;
}

// Validate timezone
function validateTimezone(tz){
	var regex = /^(Asia|Africa|Australia|America|Europe|[a-zA-Z]|UTC)\/([a-zA-Z]{3,})$/;
    if (!regex.test(tz.val())) {
        tz.parent().addClass('has-error');
        return false;
    }
    tz.parent().removeClass('has-error');
    return true;
}

// Validate birhdate
function validateBdate(bdate) {
	var regex = /^(19[0-9]{2}|[2-9][0-9]{3})-((0(1|3|5|7|8)|10|12)-(0[1-9]|1[0-9]|2[0-9]|3[0-1])|(0(4|6|9)|11)-(0[1-9]|1[0-9]|2[0-9]|30)|(02)-(0[1-9]|1[0-9]|2[0-9]))$/;
    if (!regex.test(bdate.val())) {
        bdate.parent().addClass("has-error");
        return false;
    }
    bdate.parent().removeClass("has-error");
    return true;
}

// Validate UID
function validateUID(uid){
	var regex = /^(([a-zA-Z0-9]){8,50})$/;
    if (!regex.test(uid.val())) {
        uid.parent().addClass("has-error");
        return false;
    }
    uid.parent().removeClass("has-error");
    return true;
}