(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        var appId = request.pathParams.app_id;

        if (!appId) {
            response.setStatus(400);
            response.setBody({
                error: 'App ID is missing'
            });
            return;
        }

        var result = new global.IDEGlobalUtils().deleteSysAppRecord(appId);

        if (!result) {
            response.setStatus(500);
            response.setBody({
                error: 'Record cannot be deleted'
            });
            return;
        }

        response.setStatus(200);
    } catch (e) {
        // Handle any unexpected errors
        var errorMessage = '[IDE] Failed to delete the SysApp record';
        response.setStatus(500);
        response.setBody({
            error: errorMessage,
            details: e.message
        });
    }
})(request, response);
