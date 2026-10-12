(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var result = {};
    var businessObjectiveGr = {};
    var solutionsGr = {};
    var totalApps = 0;
    var totalRecommendedApps = 0;
    var installedApps = 0;
    var application = {};
    var applicationGr = {};
    var constants = new AdminCenterConstants();
    var adminCenterApplicationsUtil = new AdminCenterApplicationsUtil();
    var appStatusData = adminCenterApplicationsUtil.fetchAppStatusData(adminCenterApplicationsUtil.getAppIds());
    var appStatus, businessObjectiveTitle;
    var adminCenterUtil = new AdminCenterUtil();

    businessObjectiveGr = new GlideRecord('sn_admin_center_business_objective');
    businessObjectiveGr.orderBy('name');
    businessObjectiveGr.query();

    while (businessObjectiveGr.next()) {
        solutionsGr = new GlideRecord('sn_admin_center_solution');
        solutionsGr.addQuery('objective', businessObjectiveGr.getUniqueValue());
        solutionsGr.query();
        totalApps = 0;
        totalRecommendedApps = 0;
        installedApps = 0;

        while (solutionsGr.next()) {
            application = solutionsGr.application;

            applicationGr = adminCenterApplicationsUtil.getApplicationGlideRecord(application);
            if (!applicationGr)
                continue;

            appStatus = adminCenterApplicationsUtil.getAppStatus(applicationGr, appStatusData);
            if (!appStatus)
                continue;

            // only include in final counts if recommended
            if (solutionsGr.weight.toString() === '1') {
                totalRecommendedApps++;
                installedApps = appStatus.isInstalled ? installedApps + 1 : installedApps;
            }
            totalApps++;
        }

        if (totalApps == 0)
            continue;

        businessObjectiveTitle = adminCenterUtil.getBusinessObjectiveTitle(businessObjectiveGr.getUniqueValue());

        result[businessObjectiveGr.getUniqueValue()] = {
            'id': businessObjectiveGr.getUniqueValue(),
            'title': businessObjectiveTitle,
            'totalApplications': totalRecommendedApps,
            'installedApplications': installedApps
        };
    }

    response.setContentType('application/json');
    response.setStatus(200);
    response.setBody(result);

})(request, response);
