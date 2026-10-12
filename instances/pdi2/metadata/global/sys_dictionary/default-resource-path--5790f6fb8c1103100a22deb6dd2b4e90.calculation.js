function normalizePath(path) {
	// replace repeating '/' chars with a single '/'
	path = path.replace(/\/+/g, '/');
	path = path.trim();
	// remove the trailing '/' if present
	if (path.charAt(path.length-1) == '/') {
		path = path.substring(0, path.length-1);
	}
	return path;
}

function operationInDefaultVersion() {
	return (current.web_service_version != '' &&
		current.web_service_definition.default_version == current.web_service_version.version_id);
}

function resolveDefaultOperationPath() {
	// if not versioned or operation belongs to default version
	if (operationInDefaultVersion()) {
		var endpointPath = current.web_service_definition.base_uri + '/' + current.relative_path;
		return normalizePath(endpointPath);
	}
	
	return '';
}

current.default_operation_uri = resolveDefaultOperationPath();
