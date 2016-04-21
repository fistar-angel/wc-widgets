"use strict";

//***********************
//	Global variables
//***********************
//var url = ;


//***********************
//	 Ready document
//***********************
/*
$(document).ready(function() {
	console.log("BaseUrl operator is ready!");

	var handleApiURL = function handleApiURL(preference){
		url = MashupPlatform.prefs.get("FRE_APIs");
	}
	
	url = MashupPlatform.prefs.get("FRE_APIs");
	MashupPlatform.prefs.registerCallback(handleApiURL);	
	
	MashupPlatform.wiring.pushEvent("baseURL", url);
	MashupPlatform.wiring.pushEvent("medicalStaff", MashupPlatform.context.get('username'));
});
*/

var hostSettings = function hostSettings() {
};

hostSettings.prototype.init = function init() {
	this.url 		= "http://130.206.82.133:5000";
	this.username 	= MashupPlatform.context.get('username');
	setURL.call(this, MashupPlatform.prefs.get("FRE_APIs"));
	MashupPlatform.prefs.registerCallback(handlerPreferences.bind(this));
};

var handlerPreferences = function handlerPreferences(preferences) {
	setURL.call(this, MashupPlatform.prefs.get("FRE_APIs"));
};

var setURL = function setURL(url) {
	this.url = url;
	MashupPlatform.wiring.pushEvent("baseURL", url);
	MashupPlatform.wiring.pushEvent("medicalStaff", this.username);
};

var hostSettings = new hostSettings();
document.addEventListener("DOMContentLoaded", hostSettings.init.bind(hostSettings), false);