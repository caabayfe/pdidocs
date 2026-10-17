(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        var requestBody = request.body.data;
        var appSysId = requestBody.app_sys_id;
        var pageNames = requestBody.page_names || null;  // Optional array

        // Validate mandatory appSysId
        if (!appSysId) {
            return response.setStatus(400).setBody({ status: 'error', message: gs.getMessage('AppSysId is required') });
        }

        // Call the Script Include to fetch page names
        var result = new UXAPageUtils().fetchPageNames(appSysId, screenType, operatingSystem, pageNames);

        return response.setBody(result);
    } catch (error) {
        return response.setStatus(500).setBody({ status: 'error', message: gs.getMessage('An unexpected error occurred') });
    }
})(request, response);
