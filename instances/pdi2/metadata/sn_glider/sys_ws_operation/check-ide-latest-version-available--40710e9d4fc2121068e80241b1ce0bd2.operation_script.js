(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var appId = request.pathParams.app_id;

    var responseObject = {
        update_available: false, // Default status
        app_id: appId,
        current_version: null,
        latest_version: null
    };

    var updateChecker = new sn_appclient.UpdateChecker();
    var versionComparator = new sn_appclient.VersionComparator();
    var app = updateChecker._getApp(appId);

    if (app && app.getRecordClassName() == 'sys_store_app') {
        responseObject.current_version = app.getValue('version');
        responseObject.latest_version = app.getValue('latest_version');
        
        if (versionComparator.isUpgrade(responseObject.current_version, responseObject.latest_version)) {
            responseObject.update_available = true;
        }
    }

    gs.info('App Update Check - App ID: ' + responseObject.app_id + ', Status: ' + responseObject.update_status);

    response.setBody(responseObject);


})(request, response);
