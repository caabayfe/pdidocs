(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    // Check if user has the "Submit for Deployment" delegated dev permission
    var access = gs.hasRightsTo("api/sn_app_eng_studio.applications.deployment_request/POST", {
        scopeId: request.pathParams.application_sys_id
    });
    if (!access) {
        throw new sn_ws_err.ServiceError()
            .setStatus(403)
            .setMessage(gs.getMessageLang("Access denied. Submit for Deployment delegated development permission required.", "en"))
            .setDetail(gs.getMessage("Access denied. Submit for Deployment delegated development permission required."));
    }

    var aesUtils = new AesUtils();

    // get controller instanceUrl and creds

    var pipelineConfigChecks = new sn_pipeline.PipelineConfigChecks();

    var grController = pipelineConfigChecks.getControllerRecord();

    if (!grController) {
        throw new sn_ws_err.ServiceError()
            .setStatus(500)
            .setMessage(gs.getMessageLang("Controller environment has not been setup.", "en"))
            .setDetail(gs.getMessage("Controller environment has not been setup."));
    }

    var prodBaseInstanceUrl = grController.instance_url;
    var prodCredRef = grController.instance_credential.getRefRecord();

    var adminEmail = (new sn_pipeline.PipelineAdminEmailUtil()).getAdminEmail();

    var inputs = {
        url: prodBaseInstanceUrl,
        application_sys_id: request.pathParams.application_sys_id,
        admin_email: adminEmail,
		instance_credential: prodCredRef
    };
    
	var requestData = request.body.data;
	
	requestData.app_sys_id = inputs.application_sys_id;

    // Add user information to request
    var users = new GlideRecord("sys_user");
    var userAttributes;
    var attributeValue;

    if (users.get(gs.getUserID())) {
        userAttributes = ["email", "user_name", "first_name", "last_name"];
        userAttributes.forEach(function(attribute) {
            if (!users[attribute].nil()) {
                requestData["requestor_" + attribute] = users.getValue(attribute);
            }
        });
    }

    // Get application files
    var files = FileDataBuilder.build([request.pathParams.application_sys_id]);

    // Create array of objects with object name and launch url
    // [{ name : "Workspace", url: "/api/now/workspace_administration/workspace_url/8735d7f2b7215010835d6f54ce11a934" }]
    var launchUrls = files.reduce(function(prev, current) {
        if (current.name && current.launch_url) {
            prev.push({
                name: current.name,
                url: current.launch_url
            });
        }
        return prev;
    }, []);

    if (launchUrls.length) {
        requestData.launch_urls = JSON.stringify(launchUrls);
    }
	
	inputs.request_data = JSON.stringify(requestData);

    // Run an action from a server-side script synchronously.
	var deploymentRequestResponse = sn_fd.FlowAPI.executeSubflow('sn_app_eng_studio.deployment_request_subflow', inputs);

    if (deploymentRequestResponse.has_error) {
        var error = new sn_ws_err.ServiceError();
        error.setStatus(deploymentRequestResponse.status_code);
        error.setMessage(deploymentRequestResponse.error_message);

        return response.setError(error);
    }

    var responseBody = JSON.parse(deploymentRequestResponse.body).result;
    var key = responseBody.state;
    var applicationStatusHelper = new ApplicationStatusHelper;

    responseBody.status = applicationStatusHelper.appStatusMapping[key];

    response.setBody(responseBody);
    response.setStatus(200);

})(request, response);
