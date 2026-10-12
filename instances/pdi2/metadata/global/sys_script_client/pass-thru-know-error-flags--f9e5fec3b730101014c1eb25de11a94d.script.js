function onLoad() {
	var abortedFlags = {
		'opStatusServiceEmpty': false //error: empty service (no entry-points) cannot be operational. From BS rule : "Change to operational status"
	};
	
	for (var flag in abortedFlags) {
		if (abortedFlags.hasOwnProperty(flag) && g_user.getClientData(flag) === 'true')
			abortedFlags[flag] = true;
	}
	
	//sending all whitelisted flags to the angular form page.
	CustomEvent.fireAll('SA_BUSINESS_SERVICE_PAGE_ABORTED_FLAGS', abortedFlags);
}
