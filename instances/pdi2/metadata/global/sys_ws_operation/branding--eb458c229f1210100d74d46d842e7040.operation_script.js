(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var settings = sn_cs.VASystemObject.getSettings(getParamAsString("branding_key"));

	if (settings) {
		status = 200;
		return settings;
	} else {
		status = 404;
	}
	
	//make sure we always get strings from the parameter map
	function getParamAsString(paramName) {
		if (request.queryParams.hasOwnProperty(paramName))
			return request.queryParams[paramName] + '';
		return '';
	}

})(request, response);
