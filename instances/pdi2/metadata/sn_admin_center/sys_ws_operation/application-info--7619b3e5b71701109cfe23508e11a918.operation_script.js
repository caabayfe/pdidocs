(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var applicationId = request.pathParams.applicationId;
    var adminCenterApplicationsUtil = new AdminCenterApplicationsUtil();
    var applicationGr = adminCenterApplicationsUtil.getApplicationGlideRecord(applicationId);
    if (!applicationGr)
        return {};

    var appStatusData = adminCenterApplicationsUtil.fetchAppStatusData([adminCenterApplicationsUtil.getApplicationId(applicationGr)]);
    var appStatus = adminCenterApplicationsUtil.getAppStatus(applicationGr, appStatusData);
    if (!appStatus)
        return {};

    var installationStatus = adminCenterApplicationsUtil.getInstallationStatus(appStatus);
    var dateText = adminCenterApplicationsUtil.getDateText(appStatus, installationStatus);

    var result = {
        businessImpact: applicationGr.getDisplayValue('business_impact') ? applicationGr.getDisplayValue('business_impact') : null,
        estimatedCompletionTime: applicationGr.getDisplayValue('estimated_implementation_time') ? applicationGr.getDisplayValue('estimated_implementation_time') : null,
        isPlugin: appStatus.isPlugin,
        applicationId: applicationGr.getValue('application_id'),
        pluginId: applicationGr.getValue('plugin_id'),
        appName: applicationGr.getValue('name'),
        licensing: appStatus.isApplication ? 'yes' : appStatus.entitled,
        status: installationStatus,
        dateText: dateText,
        appDetailsLink: adminCenterApplicationsUtil.getAppDetailsLink(appStatus)
    };

    response.setContentType('application/json');
    response.setStatus(200);
    response.setBody(result);

})(request, response);
