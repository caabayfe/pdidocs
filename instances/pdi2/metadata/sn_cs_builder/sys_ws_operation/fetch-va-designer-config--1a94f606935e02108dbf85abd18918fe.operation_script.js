(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    // Get the "view" query parameter
    var viewParam = request.queryParams.view || [];
	var fieldsParam = request.queryParams.fields || [];
	var rolesParam = request.queryParams.roles || [];
	var fields = fieldsParam[0];
	var roles = rolesParam[0];

	var view = viewParam[0] || (fields ? null : 'main');

    // Create an instance of the VADConfigUtil Script Include
    var vadConfigUtil = new VADConfigUtil();

    // Load the appropriate config using the "view" query parameter
    var config = vadConfigUtil.load(view, fields, roles);

    // Set the response body to the loaded config
    response.setBody(config);
})(request, response);
