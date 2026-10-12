(function executeRule(current, previous /*null when async*/) {
	var fullUrl = current.inputs.workspace_page_url;

	if (fullUrl) {
		// Remove domain for portability
		// e.g. https://myinstance.service-now.com/now/myworkspace/home -> /now/myworkspace/home
		var relativeUrl = fullUrl.replace(/^.*?\/\/[^\/]+/, '');
		current.inputs.workspace_page_url = relativeUrl;
	}
})(current, previous);
