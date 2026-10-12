(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        var requestBody = request.body.data;
        var appSysId = requestBody.app_sys_id;
        var searchTerm = requestBody.search_term;
        var operatingSystem = requestBody.operating_system || 'web';  // Optional, default to 'web'

        // Validate mandatory fields
        if (!appSysId || !searchTerm) {
            return response.setStatus(400).setBody({ status: 'error', message: gs.getMessage('AppSysId and Search Term are required') });
        }

        // Call the Script Include to search for page display names
        var result = new UXAPageUtils().searchPageDisplayName(appSysId, searchTerm, operatingSystem);

        return response.setBody(result);
    } catch (error) {
        return response.setStatus(500).setBody({ status: 'error', message: gs.getMessage('An unexpected error occurred') });
    }
})(request, response);
