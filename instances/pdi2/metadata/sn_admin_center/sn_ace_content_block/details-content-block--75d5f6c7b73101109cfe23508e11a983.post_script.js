(function(context) {
    /*
        context = {
            'block_id': @sysId,
            'name': @String,
            'title': @String,
            'subtitle': @String,
            'order': @Number,
            'type': @Object,
            'children': @Array[context],
            'props_details': @Object
        };
    */
    var businessObjectiveId = context.pageParams.businessObjectiveId;
    var businessObjectiveData = getBusinessObjectiveData(businessObjectiveId);
    context.pageParams.pageData = getPageData(businessObjectiveId, businessObjectiveData);

    function getPageData(businessObjectiveId, businessObjectiveData) {
        var pageData = {
            summaryCardData: {},
            nextUpCardData: {},
            appsListData: {},
            error: null
        };
        var appsListDataAndMetadata = {};
        try {
            appsListDataAndMetadata = getAppsListData(businessObjectiveId);

            pageData.summaryCardData = getSummaryCardData(businessObjectiveId, appsListDataAndMetadata.installedApps, appsListDataAndMetadata.totalApps, businessObjectiveData);
            pageData.nextUpCardData = prepareNextUpCardData(appsListDataAndMetadata.nextUpApp, businessObjectiveId, businessObjectiveData.name);

            pageData.appsListData = {
                categorizedAppsList: appsListDataAndMetadata.categorizedAppsList,
                nextUpApplicationId: appsListDataAndMetadata.nextUpApp ? appsListDataAndMetadata.nextUpApp.applicationId : null,
            };

            if (appsListDataAndMetadata.nextUpApp)
                pageData.appsListData['nextUpApplicationId'] = appsListDataAndMetadata.nextUpApp.applicationId;
        } catch (error) {
            pageData.error = error;
            gs.error('[ADMIN_CENTER] Details Block error. ' + error);
        }

        return pageData;
    }

    function getAppsListData(businessObjectiveId) {
        var result = getBusinessObjectiveSolutions(businessObjectiveId);

        return {
            categorizedAppsList: result.appsData,
            installedApps: result.installedApps,
            totalApps: result.totalApps,
            nextUpApp: result.nextUpApp
        };
    }

    function getBusinessObjectiveSolutions(businessObjectiveId) {
        var installedApps = 0;
        var totalApps = 0;
        var applicationData = {};
        var adminCenterApplicationsUtil = new AdminCenterApplicationsUtil();
        var solution = new GlideRecord('sn_admin_center_solution');
        solution.addQuery('objective', businessObjectiveId);
        solution.query();
        var appStatusData = adminCenterApplicationsUtil.fetchAppStatusData(adminCenterApplicationsUtil.getAppIdsForBusinessObjective(businessObjectiveId));
        while (solution.next()) {
            applicationData = getAppData(solution, adminCenterApplicationsUtil, appStatusData);
            if (!applicationData)
                continue;

            adminCenterApplicationsUtil.addApplication(applicationData);

            // include in counts if recommended
            if (solution.weight.toString() === '1') {
                totalApps++;
                installedApps = !applicationData.status ? installedApps : installedApps + 1;
            }
        }

        return {
            appsData: adminCenterApplicationsUtil.generateAppsListModel(),
            installedApps: installedApps,
            totalApps: totalApps,
            nextUpApp: adminCenterApplicationsUtil.findNextUpApp()
        };
    }

    function getAppData(solution, adminCenterApplicationsUtil, appStatusData) {
        var applicationId = solution.getValue('application');
        var application = adminCenterApplicationsUtil.getApplicationGlideRecord(applicationId);
        if (!application)
            return null;

        var appStatus = adminCenterApplicationsUtil.getAppStatus(application, appStatusData);
        if (!appStatus)
            return null;

        var maturityValue = solution.getValue('maturity');
        var weightValue = solution.getValue('weight');
        var installationStatus = adminCenterApplicationsUtil.getInstallationStatus(appStatus);
        var dateText = adminCenterApplicationsUtil.getDateText(appStatus, installationStatus);
        var guidedSetupProgress = adminCenterApplicationsUtil.getGuidedSetupProgress(application.getValue('guided_setup_url'));

        return {
            applicationId: applicationId,
            maturityValue: maturityValue,
            weightValue: weightValue,

            // Solution
            maturity: getMaturityDisplayValue(maturityValue),
            weight: getWeightDisplayValue(weightValue),
            guidedSetupProgressMessage: guidedSetupProgress ? gs.getMessage('Setup ({0}% complete)', guidedSetupProgress) : null,

            // Application
            name: application.getValue('sys_name'),
            summary: application.summary.getDisplayValue(),
            businessImpact: application.getValue('business_impact'),
            estimatedImplementationTime: application.getValue('estimated_implementation_time'),
            landingPageUrl: application.getValue('guided_setup_url'),
            appDetailsLink: adminCenterApplicationsUtil.getAppDetailsLink(appStatus),

            // business Objective Data
            businessObjectiveName: !gs.nil(solution.objective) && !gs.nil(solution.objective.name) ? solution.objective.name.getDisplayValue() : '',

            // Status
            licensing: appStatus.isApplication ? 'yes' : appStatus.entitled,
            status: installationStatus,
            dateText: dateText,
            isHighlighted: false
        };
    }

    function getMaturityDisplayValue(maturityLevel) {
        var maturityLevelsToDisplayValueMap = {
            '1': 'Crawl',
            '2': 'Walk',
            '3': 'Run',
            '4': 'Fly'
        };

        return maturityLevelsToDisplayValueMap[maturityLevel] || 'N/A';
    }

    function getWeightDisplayValue(weightLevel) {
        var weightLevelsToDisplayValueMap = {
            '1': gs.getMessage('Recommended'),
            '2': gs.getMessage('Optional')
        };

        return weightLevelsToDisplayValueMap[weightLevel] || 'N/A';
    }

    function getSummaryCardData(businessObjectiveId, installedApps, totalApps, businessObjectiveData) {

        return {
            installedApps: installedApps,
            totalApps: totalApps,
            summary: businessObjectiveData.summary,
            resources: businessObjectiveData.resources,
            businessObjectiveId: businessObjectiveId,
            businessObjectiveName: businessObjectiveData.name
        };
    }

    function getBusinessObjectiveData(businessObjectiveId) {
        var adminCenterBusinessObjective = new GlideRecord('sn_admin_center_business_objective');
        var adminCenterUtil = new AdminCenterUtil();

        // ToDo: Handle no business objective record found
        if (!adminCenterBusinessObjective.get(businessObjectiveId))
            return {};

        return {
            sys_id: businessObjectiveId,
            name: adminCenterUtil.getBusinessObjectiveTitle(businessObjectiveId),
            summary: adminCenterBusinessObjective.summary.getDisplayValue(),
            resources: adminCenterBusinessObjective.resources.getDisplayValue()
        };
    }

    function prepareNextUpCardData(nextUpApp, businessObjectiveId, businessObjectiveName) {
        if (!nextUpApp)
            return null;

        return {
            title: gs.getMessage('Next up'),
            applicationName: nextUpApp.name,
            applicationSysId: nextUpApp.applicationId,
            status: nextUpApp.status,
            businessObjectiveId: businessObjectiveId,
            businessObjectiveName: businessObjectiveName,
            landingPageUrl: nextUpApp.landingPageUrl,
            appDetailsLink: nextUpApp.appDetailsLink
        };
    }
})(context);
