function normalizePath(path) {
	// replace repeating '/' chars with a single '/'
	path = path.replace(/\/+/g, '/');
	path = path.trim();
	// remove the trailing '/' if present
	if (path.charAt(path.length-1) == '/')
		path = path.substring(0, path.length-1);
	
	return path;
}

function resolveOperationUri() {
	if (current.web_service_definition != '') {
		var versionId = '';
		if (current.web_service_version != '')
			versionId = current.web_service_version.version_id + '/';
		
		var endpointPath = '/api/' + current.web_service_definition.namespace + '/' + versionId
		+ current.web_service_definition.service_id
		+ '/' + current.relative_path;
		
		return normalizePath(endpointPath);
	}
	return '';
}

current.operation_uri = resolveOperationUri();
