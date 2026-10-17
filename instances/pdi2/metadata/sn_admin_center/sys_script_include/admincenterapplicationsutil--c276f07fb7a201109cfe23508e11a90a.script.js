var AdminCenterApplicationsUtil = Class.create();
AdminCenterApplicationsUtil.prototype = {
    initialize: function() {
        this._constants = new AdminCenterConstants();
        var maturityGroupLiterals = this._constants.MATURITY_GROUP_LITERALS;
        this._maturityGroupDataMap = {
            crawl: this._generateMaturityGroup(maturityGroupLiterals.crawl.name, maturityGroupLiterals.crawl.description),
            walk: this._generateMaturityGroup(maturityGroupLiterals.walk.name, maturityGroupLiterals.walk.description),
            run: this._generateMaturityGroup(maturityGroupLiterals.run.name, maturityGroupLiterals.run.description),
            fly: this._generateMaturityGroup(maturityGroupLiterals.fly.name, maturityGroupLiterals.fly.description),
        };
        this._fetchAppStatusDataApi = new FetchAppStatusData();
    },

    getAppIds: function() {
        var appIds = [];
        var businessObjectiveGr = new GlideRecord('sn_admin_center_business_objective');
        businessObjectiveGr.query();
        while (businessObjectiveGr.next()) {
            appIds.push.apply(appIds, this.getAppIdsForBusinessObjective(businessObjectiveGr.getUniqueValue()));
        }

        return appIds;
    },

    getAppIdsForBusinessObjective: function(businessObjectiveId) {
        var appIds = [];
        var solutionsGr = new GlideRecord('sn_admin_center_solution');
        solutionsGr.addQuery('objective', businessObjectiveId);
        solutionsGr.query();
        while (solutionsGr.next())
            appIds.push(this.getApplicationId(this.getApplicationGlideRecord(solutionsGr.application)));

        return appIds;
    },

    fetchAppStatusData: function(appIds) {
        return this._fetchAppStatusDataApi.fetchData(appIds);
    },

    getAppStatus: function(application, appStatusData) {
        if (!appStatusData)
            return null;

        var id = this.getApplicationId(application);
        var appStatus = appStatusData[id];
        if (!appStatus)
            return null;

        return appStatus;
    },

    getApplicationId: function(application) {
        return application.application_type.toString() === this._constants.APPLICATION ? application.application_id : application.plugin_id;
    },

    getInstallationStatus: function(appStatus) {
        if (!appStatus.isInstalled)
            return appStatus.isInstalled;

        if (appStatus.isInstalledAndUpdateAvailable)
            return 'update';

        var updateDate = this.getUpdateDate(appStatus);
        var installDate = this.getInstallDate(appStatus);
        if (updateDate && updateDate.after(installDate))
            return 'updated';

        return appStatus.isInstalled;
    },

    getDateText: function(appStatus) {
        let dateText = '';
        if (!appStatus.isInstalled || appStatus.isInstalledAndUpdateAvailable)
            return dateText;

        const updatedDate = this.getUpdateDate(appStatus);
        const installedDate = this.getInstallDate(appStatus);

        if (updatedDate !== null && (installedDate === null || updatedDate.after(installedDate)))
            dateText = gs.getMessage('Updated {0}', this._getFormattedDate(updatedDate));
        else if (installedDate !== null)
            dateText = gs.getMessage('Installed {0}', this._getFormattedDate(installedDate));

        return dateText;
    },

    _getFormattedDate: function(dateValue) {
        return dateValue.getDate().getByFormat('yyyy/MM/dd');
    },

    getInstallDate: function(appStatus) {
        var appGr = this.getAppGr(appStatus);

        return appGr && appGr.install_date ? new GlideDateTime(appGr.install_date) : null;
    },

    getUpdateDate: function(appStatus) {
        if (appStatus.isPlugin)
            return null;

        var appGr = this.getAppGr(appStatus);

        return appGr && appGr.update_date ? new GlideDateTime(appGr.update_date) : null;
    },

    getAppGr: function(appStatus) {
        if (appStatus.isPlugin) {
            var pluginGr = new GlideRecord('sys_plugins');

            return pluginGr.get('source', appStatus.plugin_id) ? pluginGr : null;
        }

        var appGr = new GlideRecord('sys_store_app');
        if (appGr.get(appStatus.sys_id))
            return appGr;

        appGr = new GlideRecord('sys_remote_app');

        return appGr.get(appStatus.sys_id) ? appGr : null;
    },

    // returns the progress from the gsw_status_of_content table if guided setup exists; null if not required or not found on the instance
    getGuidedSetupProgress: function(landingUrl) {
        if (!landingUrl)
            return null;

        var fixedLandingUrl = gs.urlDecode(landingUrl);
        var hasGuidedSetup = fixedLandingUrl.indexOf('guided_setup.do');
        if (hasGuidedSetup < 0)
            return null;

        // any remaining landing URL looks like guided_setup.do%23/content/<sys_id of the content>
        var guidedSetupSysId = fixedLandingUrl.match(/.+(content\/[^/]+)/)[1].split('/')[1].split('?')[0];

        // query guided setup content status table to get the progress of the app's guided setup
        var guidedSetupGr = new GlideRecord('gsw_status_of_content');
        if (guidedSetupGr.get('content', guidedSetupSysId))
            return guidedSetupGr.progress;

        return '0';
    },

    getAppDependencies: function(appStatus) {
        return this._fetchAppStatusDataApi.getAppDependencies(appStatus);
    },

    hasVideoUrl: function(applicationId) {
        var application = this.getApplicationGlideRecord(applicationId);
        var videoUrl = null;
        if (application)
            videoUrl = application.video_url;

        // To Do: Validate url
        // !! will return false if videoUrl is undefined, null or empty string
        return !!videoUrl;
    },

    addApplication: function(application) {
        var maturityGroupId = application.maturity.toLowerCase();
        var maturityGroup = this._maturityGroupDataMap[maturityGroupId];
        if (maturityGroup)
            this._addToGroupWeight(maturityGroupId, application.weight.toLowerCase(), application);
        else
            gs.error('[ADMIN_CENTER] Cannot add application. No such maturity group. Group id ' + maturityGroupId);
    },

    generateAppsListModel: function() {
        var _self = this;
        var model = [];
        var maturityGroup;
        var isAnyMaturityGroupWeightExpandedAlready = false;

        function compareWeights(weight1, weight2) {
            if (weight1 === weight2)
                return 0;
            if (weight1 === 'recommended')
                return -1;
            if (weight2 === 'recommended')
                return 1;

            return 0;
        }

        for (var maturityGroupId in _self._maturityGroupDataMap) {
            maturityGroup = _self._maturityGroupDataMap[maturityGroupId];
            isAnyMaturityGroupWeightExpandedAlready = false;
            maturityGroup.weights.sort(compareWeights);
            maturityGroup.weights.forEach(function(weight) {
                maturityGroup[weight].isCollapsed = _self._shouldMaturityGroupWeightBeCollapsed(maturityGroup[weight], isAnyMaturityGroupWeightExpandedAlready);
                isAnyMaturityGroupWeightExpandedAlready = isAnyMaturityGroupWeightExpandedAlready || !maturityGroup[weight].isCollapsed;
                maturityGroup.isCompleted = maturityGroup.isCompleted && _self._areAllRecommendedApplicationsInstalledInGroupWeight(maturityGroup[weight]);

                _self._sortApplicationsInPlace(maturityGroup[weight].applications);

                /*
                Array weightedApplications is created to provide UI Builder Repeater with a Data array.
                To Do: Remove this once DEF0269722 is fixed.
                */
                maturityGroup.weightedApplications.push(maturityGroup[weight]);
            });
            if (maturityGroup.hasApps)
                model.push(maturityGroup);
        }

        return model;
    },

    findNextUpApp: function(isSortRequired) {
        var _self = this;
        var maturityGroupId, maturityGroup, weight, weightIndex, applications, applicationIndex;
        for (maturityGroupId in _self._maturityGroupDataMap) {
            maturityGroup = _self._maturityGroupDataMap[maturityGroupId];
            for (weightIndex = 0; weightIndex < maturityGroup.weights.length; weightIndex++) {
                weight = maturityGroup.weights[weightIndex];
                if (!maturityGroup[weight])
                    continue;
                applications = maturityGroup[weight].applications;
                if (isSortRequired)
                    _self._sortApplicationsInPlace(applications);

                for (applicationIndex = 0; applicationIndex < applications.length; applicationIndex++) {
                    if (_self._canBeNextUp(applications[applicationIndex]))
                        return applications[applicationIndex];
                }
            }
        }

        return null;
    },

    getApplicationGlideRecord: function(applicationId) {
        if (!applicationId)
            return null;

        var applicationGr = new GlideRecord(this._constants.APPLICATIONS_TABLE_NAME);
        if (!applicationGr.get(applicationId))
            return null;

        return applicationGr;
    },

    userCanInstallOrUpgrade: function() {
        return gs.hasRole('sn_appclient.app_client_user');
    },

    getAppDetailsLink(appStatus) {
        if (!appStatus)
            return `javascript:console.error('[ADMIN_CENTER] Invalid link')`;

        var isPolarisEnabled = gs.getProperty('glide.ui.polaris.experience', 'true') == 'true';
		
        if (!isPolarisEnabled) {
            var sysparmSearch = appStatus.isApplication ? appStatus.scope : appStatus.plugin_id;
            return `/nav_to.do?uri=$allappsmgmt.do?sysparm_search==${sysparmSearch}`;
        }

        if (appStatus.isApplication)
            return `/now/app-manager/home/app/id/${appStatus.sys_id}/details`;
        else
            return `/now/app-manager/home/plugin/id/${appStatus.plugin_id}/details`;
    },

    _shouldMaturityGroupWeightBeCollapsed: function(maturityGroupWeight, isAnyMaturityGroupWeightExpandedAlready) {

        if (maturityGroupWeight.weight === 'recommended')
            return false;

        // If a previous group is expanded, we return the default collapsed status
        // If group is not collapsed by default, we check if group has uninstalled applications
        if (isAnyMaturityGroupWeightExpandedAlready)
            return maturityGroupWeight.isCollapsed || this._areAllApplicationsInstalledInGroupWeight(maturityGroupWeight);

        // If no group is previously expanded, we check if group has uninstalled applications
        return this._areAllApplicationsInstalledInGroupWeight(maturityGroupWeight);
    },
    _areAllApplicationsInstalledInGroupWeight: function(groupWeight) {
        return groupWeight.installedCount === groupWeight.applications.length;
    },

    _areAllRecommendedApplicationsInstalledInGroupWeight: function(groupWeight) {
        var index, application;
        for (index = 0; index < groupWeight.applications.length; index++) {
            application = groupWeight.applications[index];

            // if any recommended application (weightValue = 1) is not installed (status = false)
            if (application.weightValue === '1' && !application.status)
                return false;
        }

        return true;
    },

    _generateMaturityGroup: function(maturityDisplayValue, maturityDescription) {
        var _self = this;
        var maturityGroup = {
            maturity: maturityDisplayValue,
            maturityDescription: maturityDescription,
            weights: [],
            hasApps: false,
            weightedApplications: [],
            isCompleted: true
        };

        return maturityGroup;
    },

    _generateWeightData: function(weightId) {

        return {
            weight: weightId,
            applications: [],
            installedCount: 0,
            isCollapsed: this.DEFAULT_APPLICATION_WEIGHTS_COLLAPSED_STATUS_MAP[weightId]
        };
    },

    _addToGroupWeight: function(maturityGroupId, weight, application) {
        var group = this._maturityGroupDataMap[maturityGroupId];
        if (!group) {
            gs.error('[ADMIN_CENTER] No such maturity group. Group id ' + maturityGroupId);

            return;
        }
        if (!group[weight]) {
            group.weights.push(weight);
            group[weight] = this._generateWeightData(weight);
        }
        group[weight].applications.push(application);
        group.hasApps = true;
        // status is true if app is installed
        if (application.status)
            group[weight].installedCount++;
    },

    _sortApplicationsInPlace: function(applications) {

        function compareMaturityLevelValues(application1, application2) {

            // 	Maturity Level values are 1, 2, 3... with 1 being the highest
            return application1.maturityValue - application2.maturityValue;
        }

        function compareWeightValues(application1, application2) {

            // 	Weight values are 1, 2... with 1 being the highest
            return application1.weightValue - application2.weightValue;
        }

        function compareInstallationStatus(application1, application2) {
            // false (Not installed), update (Needs update), true (Installed), updated
            var statusWeight = {
                'false': 3,
                'update': 2,
                'true': 1,
                'updated': 0,
            };

            return statusWeight[application2.status] - statusWeight[application1.status];
        }

        function compareName(application1, application2) {
            if (application1.name < application2.name)
                return -1;
            else if (application1.name > application2.name)
                return 1;

            return 0;
        }

        function compareApplications(application1, application2) {
            var compareFunctions = [compareMaturityLevelValues, compareWeightValues, compareInstallationStatus, compareName];
            var comparisonResult = 0;
            var compareFunctionIndex = 0;
            while (compareFunctionIndex < compareFunctions.length) {
                comparisonResult = compareFunctions[compareFunctionIndex](application1, application2);
                if (comparisonResult < 0)
                    return -1;
                else if (comparisonResult > 0)
                    return 1;

                compareFunctionIndex++;
            }

            return 0;
        }

        applications.sort(compareApplications);
    },

    _canBeNextUp: function(application) {
        // not valid if app is optional
        if (application.weightValue === '2')
            return false;

        // valid if status = false (not installed)
        // for now we aren't showing update (needs update) in next up card
        if (!application.status)
            return true;
    },

    DEFAULT_APPLICATION_WEIGHTS_COLLAPSED_STATUS_MAP: {
        recommended: false,
        optional: true
    },

    type: 'AdminCenterApplicationsUtil'
};
