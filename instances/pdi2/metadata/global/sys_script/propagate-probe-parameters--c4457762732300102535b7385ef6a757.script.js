// THIS BUSINESS RULE MUST RUN BEFORE THE "Probe Prelaunch Check" BUSINESS RULE
// SO THAT THE PROPER PARAMETERS ARE POPULATED FOR THE PRELAUNCH CHECK
(function executeRule(current, previous /*null when async*/) {
	
	// set of parameters that need to be propagated if they exist in the triggering input record
	// only the keys are important for this object
	var whitelistParameters = {
		classification_probe: true,
		admin_share_access : true,
		target_powershell_access : true,
		deviceHistoryParams: true
	};
	
	var responseSysID = current.response_to;
	if (!responseSysID)
		return;
	
	var currPayload = current.getValue('payload'); 
	var currParameters = getParameters(currPayload);
	if (currParameters == null)
		// didn't find any parameters in the current payload
		return;
	
	// determine which whitelist parameters are missing in the current payload
	// if they are missing, then we will attempt to find values for them in previous payload
	for (var parameter in whitelistParameters) {
		if (currParameters.includes('name="' + parameter + '"'))
			// found the parameter in current payload
			delete whitelistParameters[parameter];
	}
	
	if (Object.keys(whitelistParameters).length == 0)
		// the current payload is not missing any parameters
		return;
	
	// whitelistParameters now contains all the parameters we are missing
	// attempt to find them in the previous payload
	var eccQueueGr = new GlideRecord('ecc_queue');
	try {
		if (!eccQueueGr.get('sys_id', responseSysID)) {
			// no triggering input record
			return;
		}
	} catch (e) {
		/*
		 * Not exactly sure how, but some people encounter such a behavior in the past
		 * where exception is being thrown
		 */
		return;
	}
	
	var prevPayload = eccQueueGr.getValue('payload');

	if (prevPayload == '<see_attachment/>') {
		var sa = new GlideSysAttachment();
		prevPayload = sa.get(eccQueueGr, 'payload');
	}

	var prevParameters = getParameters(prevPayload);
	if (prevParameters == null)
		// didn't find any parameters in the previous payload
		return;
	
	var foundParameters = {};
	for (var missingParameter in whitelistParameters) {
		var regex = new RegExp("<parameter name\\s*=\\s*\""+missingParameter+"\" value\\s*=\\s*\"(.*?)\"\\s*\\/>");
		var prevMatch = regex.exec(prevPayload);
		if (!prevMatch)
			// the triggering input payload does not have the parameter set
			continue;
		
		// add the value of the parameter from the triggering input payload
		foundParameters[missingParameter] = prevMatch[1];
	}
	
	if (Object.keys(foundParameters).length == 0)
		// no missing parameter values were found in the previous payload
		return;
	
	// now add all missing parameters that we found into the new payload
	var formattedParameters = '';
	for (var foundParameter in foundParameters)
		formattedParameters += '<parameter name="' + foundParameter + '" value="' + foundParameters[foundParameter] + '"/>';
	
	currPayload = addParameters(currPayload, formattedParameters);
	current.setValue('payload', currPayload);
})(current, previous);

function getParameters(payload) {
	var parametersOpenTag = '<parameters>';
	var parametersStartIndex = payload.lastIndexOf(parametersOpenTag) + parametersOpenTag.length;
	var parametersEndIndex = payload.lastIndexOf("</parameters>");
	if (parametersStartIndex < 0 || parametersEndIndex < 0)
		return null;
	return payload.substring(parametersStartIndex, parametersEndIndex);
}

function addParameters(payload, parametersString) {
	var parametersEndTag = '</parameters>';
	var parametersEndIndex = payload.lastIndexOf(parametersEndTag);
	if (parametersEndIndex < 0)
		// couldn't find the last </parameters> tag
		return payload;
	
	var payloadBefore = payload.substring(0, parametersEndIndex);
	var payloadAfter = payload.substring(parametersEndIndex);
	var newPayload = payloadBefore + parametersString + payloadAfter;
	return newPayload;
}
