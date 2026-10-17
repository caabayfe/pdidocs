(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        var requestBody = request.body.data;
        var appSysId = requestBody.application_id;
        var name = requestBody.name;
        var displayName = requestBody.display_name;
        var properties = requestBody.properties;
		var description = requestBody.description;

        // Validate mandatory fields
        if (!appSysId || !name || !displayName) {
            return response.setStatus(400).setBody({
                status: 'error',
                message: gs.getMessage('AppSysId, Name, and Display Name are required')
            });
        }

        // Call the Script Include to update or create the page
        var result = new UXAEventUtils().updateEventName(appSysId, name, displayName, properties, description);

        return response.setBody(result);
    } catch (error) {
        return response.setStatus(500).setBody({
            status: 'error',
            message: gs.getMessage('An unexpected error occurred')
        });
    }
})(request, response);
