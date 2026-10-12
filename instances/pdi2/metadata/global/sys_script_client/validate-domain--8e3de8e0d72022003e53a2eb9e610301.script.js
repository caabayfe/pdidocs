function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	
	var url = removeProtocol(newValue);
	var errorMessage = validateDomain(url);
	if (errorMessage != null) {
		var msg = getMessage(errorMessage);
		g_form.showFieldMsg(control, msg, "error");
	} else {
		g_form.hideFieldMsg(control, "true");
	}
}

//ie. http://*.service-now.com ==> *.service-now.com
function removeProtocol(url) {
	var protocol_idx = url.indexOf('://');
	if (protocol_idx != -1) {
		if (protocol_idx + 3 < url.length)
			url = url.substring(protocol_idx + 3).trim();
		else
			url = '';
	}
	
	return url;
}

function validateDomain(url) {
	
	//disallow http://servicenow.com/incident or snc.com?a=b
	if (url.indexOf('/') > -1 || url.indexOf('?') > -1)
		return "/ and ? are not allowed in the domain pattern";
	
	//validate url if includes at least one *
	if (url.match(/\*/g) != null) {
		if (url.match(/\*/g).length >  1) //more than one * ie. http://*.snc.*.com
			return errorMessage = "Only one wildcard (*) is allowed";
		
		//if host is '*'
		if (url.length == 1)
			return "A host substring must be specified, e.g. http://*test.acme.com, https://*test.acme.com, *test.acme.com, *.acme.com, or acme.com";
		
		//if host does not start with * ie. news.*.com
		if (!url.startsWith('*'))
			return "Wildcard (*) is only allowed in the left-most justified position, e.g. http://*test.acme.com, https://*test.acme.com, *test.acme.com, *.acme.com, or acme.com";
	}
	
	return null;
}
