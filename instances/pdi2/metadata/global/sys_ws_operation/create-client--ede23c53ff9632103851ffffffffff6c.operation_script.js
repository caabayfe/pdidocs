(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    
    var requestBody = request.body.data;
    if (!requestBody) {
        response.setBody({ success: false, error_msg: "Request body is required" });
        response.setContentType("application/json");
        return;
    }
    
    // Build input JSON object with mandatory fields
    var inputObj = {
        client_id: requestBody.client_id,
        name: requestBody.name,
        status: requestBody.status  // 'live' or 'manual'
    };
    
    // Optional fields
    if (requestBody.redirect_url && requestBody.redirect_url.length > 0) {
        inputObj.redirect_url = requestBody.redirect_url;
    }
    
    if (requestBody.response_types && requestBody.response_types.length > 0) {
        inputObj.response_types = requestBody.response_types;
    }
    
    if (requestBody.client_uri) {
        inputObj.client_uri = requestBody.client_uri;
    }
    
    if (requestBody.logo_uri) {
        inputObj.logo_uri = requestBody.logo_uri;
    }
    
    if (requestBody.hasOwnProperty('localhost_redirection_allowed')) {
        inputObj.localhost_redirection_allowed = requestBody.localhost_redirection_allowed;
    }

    if (requestBody.hasOwnProperty('auth_aig_client'))
		inputObj.auth_aig_client = requestBody.auth_aig_client;

	inputObj.scope_restriction_status = "restricted";
	inputObj.token_format = "opaque";
    
    var helper = new global.CIMDMetadataHelper();
    var result = helper.createCIMDEntity(JSON.stringify(inputObj));
    
    response.setContentType("application/json");
    response.setBody(result);
    
})(request, response);
