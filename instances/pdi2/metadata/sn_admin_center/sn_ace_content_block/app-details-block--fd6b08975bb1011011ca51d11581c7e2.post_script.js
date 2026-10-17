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

    var adminCenterApplicationsUtil = new AdminCenterApplicationsUtil();
    var applicationId = context.pageParams.applicationId;
    var businessObjectiveId = context.pageParams.businessObjectiveId;
    var appData = getApplicationDetails(applicationId);
    context.pageParams.appData = appData;
    context.pageParams.appName = appData.appName;

    function getApplicationDetails(applicationId) {
        var applicationGr = adminCenterApplicationsUtil.getApplicationGlideRecord(applicationId);
        if (!applicationId || !applicationGr)
            return {};

        var id = adminCenterApplicationsUtil.getApplicationId(applicationGr);
        var appStatusData = adminCenterApplicationsUtil.fetchAppStatusData([id]);
        var appStatus = adminCenterApplicationsUtil.getAppStatus(applicationGr, appStatusData);
        if (!appStatus)
            return {};

        var isPlugin = appStatus.isPlugin;
        var dependencies = adminCenterApplicationsUtil.getAppDependencies(appStatus);
        dependencies.sort(compareDependencyName);
        var roles = getPrerequisiteRoles(applicationGr);
        roles.sort(compareRoleName);
        var installationDetails = getPluginOrAppDetails(id, applicationGr.getValue('application_type'), appStatus);
        var landingUrl = getLandingPageURL(applicationGr);
        var showInstallCard = isInstallVisible(appStatus.isInstalled, landingUrl);
        var showUpdateCard = isUpdateVisible(isPlugin, appStatus.isInstalled, appStatus.isInstalledAndUpdateAvailable);
        var showGetStartedBlock = isGetStartedBlockVisible(appStatus.isInstalled, showUpdateCard, landingUrl);
        var appName = appStatus.isApplication ? applicationGr.getValue('name') + ' (' + applicationGr.getValue('application_id') + ')' : applicationGr.getValue('name');
        var dependenciesMessage = gs.getMessage('Installing {0} activates/installs the following', appName);

        return {
            summary: applicationGr.getDisplayValue('summary'),
            keyFeatures: applicationGr.getDisplayValue('key_features'),
            businessImpact: applicationGr.getDisplayValue('business_impact'),
            estimatedCompletionTime: applicationGr.getDisplayValue('estimated_implementation_time'),
            licensing: appStatus.isApplication ? 'yes' : appStatus.entitled,
            status: appStatus.isInstalled ? 'Installed' : 'Not Installed',
            isPlugin: isPlugin,
            isInstalledAndUpdateAvailable: appStatus.isInstalledAndUpdateAvailable,
            appScope: appStatus.scope,
            applicationId: applicationGr.getValue('application_id'),
            pluginId: applicationGr.getValue('plugin_id'),
            appName: applicationGr.getValue('name'),
            appVersion: isPlugin ? '' : appStatus.version,
            latestAppVersion: isPlugin ? '' : appStatus.latest_version,
            landingUrl: landingUrl,
            showTechnicalDetails: !appStatus.isInstalled && (dependencies.length > 0 || roles.length > 0),
            dependencies: dependencies,
            dependenciesMessage: dependenciesMessage,
            roles: roles,
            installationDetails: installationDetails,
            showInstallCard: showInstallCard,
            showUpdateCard: showUpdateCard,
            showGetStartedBlock: showGetStartedBlock,
            businessObjectiveName: getBusinessObjectiveName(businessObjectiveId)
        };
    }

    function getLandingPageURL(applicationGr) {
        if (!applicationGr)
            return '';

        //URL will not be encoded as there can be a use case when a landing page url field is already encoded, 
        // that can lead to a bug
        var baseURL = gs.getProperty('glide.servlet.uri');

        if (applicationGr.getValue('guided_setup_url'))
            return baseURL + applicationGr.getValue('guided_setup_url');

        return '';
    }

    function getPluginOrAppDetails(id, type, appStatus) {
        var details = {
            name: '',
            pluginId: id,
            hasDemoData: false
        };

        if (type === 'application') {

            var grApp = new GlideRecord('sys_app_version');
            grApp.addQuery('source_app_id', id);
            grApp.query();
            if (grApp.next()) {
                details.pluginId = id;
                details.hasDemoData = grApp.getValue('demo_data') === 'has_demo_data' ? true : false;
            }

            var storeAppGr = new GlideRecord('sys_store_app');
            storeAppGr.addQuery('sys_id', id);
            storeAppGr.query();
            if (storeAppGr.next()) {
                details.name = storeAppGr.getValue('name');
                details.pluginId = storeAppGr.getValue('scope');
                details.hasDemoData = storeAppGr.getValue('demo_data') === 'has_demo_data' ? true : false;
            }
        } else if (type === 'plugin') {
            details.pluginId = id;
            details.name = appStatus ? appStatus.name : id;
            //defaulting hasDemoData to true as this will allow prompt in Plugin installer to select the demo data option
            //query on v_plugin has performance implication so defaulting it to true should be fine.
            details.hasDemoData = true;
        }
        return details;
    }

    function getPrerequisiteRoles(applicationGr) {
        var preReqRoles = [];
        if (!applicationGr.isValidRecord() || !applicationGr.getValue('roles_added'))
            return preReqRoles;

        // Expected format for roles_added : "roleNameA,roleIdA|roleNameB,roleIdB"
        var roles = applicationGr.getValue('roles_added').split('|');
        var roleIndex = 0;
        var roleValues, roleName, roleId, roleInstallationStatus, commaSeparatorIndex;
        for (roleIndex = 0; roleIndex < roles.length; roleIndex++) {
            roleValues = roles[roleIndex].trim();
            commaSeparatorIndex = roleValues.indexOf(',');
            if (commaSeparatorIndex === -1)
                continue;
            roleName = roleValues.slice(0, commaSeparatorIndex).trim();
            roleId = roleValues.slice(commaSeparatorIndex + 1).trim();
            if (!roleName || !roleId)
                continue;
            var roleGr = new GlideRecord('sys_user_role');
            if (roleGr.get('name', roleId))
                roleInstallationStatus = true;
            else
                roleInstallationStatus = false;

            preReqRoles.push(generateRole(roleName, roleId, roleInstallationStatus));
        }

        return preReqRoles;
    }

    function generateRole(roleName, roleId, roleInstallationStatus) {
        return {
            role_name: roleName,
            role_id: roleId,
            role_installation_status: roleInstallationStatus
        };
    }

    function getLicensingMessage() {
        var constants = new AdminCenterConstants();
        return constants.LICENSING_LABEL_ALL_INCLUDED;
    }
    
    function isGetStartedBlockVisible(isInstalled, needsUpdate, landingUrl) {

        if (!adminCenterApplicationsUtil.userCanInstallOrUpgrade())
            return false;

        if (!isInstalled || needsUpdate)
            return true;

        // Should show Get Started if landingUrl is not null or not empty
        return !!landingUrl;
    }

    function isInstallVisible(isInstalled, landingUrl) {
        if (isInstalled && !landingUrl)
            return false;

        return true;
    }

    function isUpdateVisible(isPlugin, isInstalled, isUpdateAndInstallAvailable) {

        // Update should be enabled only for applications that are installed
        if (isPlugin || !isInstalled)
            return false;

        return isUpdateAndInstallAvailable;
    }

    function compareDependencyName(dependency1, dependency2) {
        return compareAlphabetically(dependency1.dependency_name, dependency2.dependency_name);
    }

    function compareRoleName(role1, role2) {
        return compareAlphabetically(role1.role_name, role2.role_name);
    }

	function getBusinessObjectiveName(businessObjectiveId) {
		if (!businessObjectiveId)
			return '';

		var businessObjectiveRecord = new GlideRecord('sn_admin_center_business_objective');
		if (businessObjectiveRecord.get(businessObjectiveId)) {
			return !gs.nil(businessObjectiveRecord.name) ? businessObjectiveRecord.name.getDisplayValue() : '';
		}

		return '';
	}
	
    function compareAlphabetically(first, second) {
        var text1 = first.toLowerCase();
        var text2 = second.toLowerCase();
        if (text1 < text2)
            return -1;
        else if (text1 > text2)
            return 1;

        return 0;
    }

})(context);
