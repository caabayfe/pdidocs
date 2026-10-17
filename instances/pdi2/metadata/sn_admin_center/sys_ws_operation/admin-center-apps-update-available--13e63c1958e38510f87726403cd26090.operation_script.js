(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var result = {};
    var constants = new AdminCenterConstants();
    var adminCenterApplicationsUtil = new AdminCenterApplicationsUtil();

    var storeAppIds = [];
    var storeApp = new GlideRecord('sys_store_app');
    storeApp.addQuery('scope', constants.ADMIN_CENTER_SCOPE).addOrCondition('scope', constants.ADOPTION_BLUE_PRINT_SCOPE);
    storeApp.query();
    while (storeApp.next()) {
        storeAppIds.push(storeApp.getUniqueValue());
    }

    var appStatusData = adminCenterApplicationsUtil.fetchAppStatusData(storeAppIds);
    var baseURL = gs.getProperty('glide.servlet.uri');

    for (var i = 0; i < storeAppIds.length; i++) {

        var appStatus = appStatusData[storeAppIds[i]];
        if (!appStatus)
            continue;

        result[appStatus.scope] = {
            'isUpdateAvailable': appStatus.isInstalledAndUpdateAvailable,
            'newVersion': appStatus.latest_version,
            'name': appStatus.name,
            'baseUrl': baseURL
        };
    }

    response.setContentType('application/json');
    response.setStatus(200);
    response.setBody(result);

})(request, response);
