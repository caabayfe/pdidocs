function onLoad() {
}

var EndPointValidation = {
	// Validate a number is within a specific range
	validateNumber: function(name, val, min, max) {
		if(val >= min && val <= max)
			{
			return true;
		}
		return false;
	},
	
	validateIp: function(name, val) {
		var re = "^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$";
		if(re.exec(val) === null)
			g_form.showErrorBox(name,'This is not a valid IP address');
		else
			g_form.hideErrorBox(name);
	},
	
	validatePort: function(val) {
		port = val.replace(',','');
		if(!EndPointValidation.validateNumber('port', port, 0, 65535))
			g_form.showErrorBox('port','Port number should be between 0 and 65535');
		else
			g_form.hideErrorBox('port');
	},
	
	// Validate for a well-formed URL
	validateUrl: function(name, val) {
		var re = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
		if(re.exec(val) === null)
			g_form.showErrorBox(name,'This is not a valid URL');
		else
			g_form.hideErrorBox(name);
	},
	
		// Validate host, at the moment not empty 
	validateHost: function(name, val) {
		if(!val)
			g_form.showErrorBox(name,'Host cannot be empty');
		else
			g_form.hideErrorBox(name);
	},
	
	type: function() {
		return 'EndPointValidation';
	}
}
