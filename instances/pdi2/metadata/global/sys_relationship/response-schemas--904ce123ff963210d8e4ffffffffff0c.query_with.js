(function refineQuery(current, parent) {
    var definitionName = parent.web_service_definition.name;
	var basePath = parent.web_service_definition.base_uri;
	var resourcePath = parent.operation_uri;
	var http_method = parent.http_method;

	var pattern = /\/api\//;
	basePath = basePath.replace(pattern, "");
	resourcePath = resourcePath.replace(pattern, "/");

	var encodedQuery = "api=" + definitionName + "^api_path=" + basePath + "^http_method=" + http_method + "^api_resource=" + resourcePath;

	current.addEncodedQuery(encodedQuery);
})(current, parent);
