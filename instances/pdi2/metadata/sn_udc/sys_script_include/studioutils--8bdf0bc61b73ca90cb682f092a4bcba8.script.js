class StudioUtils {
	static type = 'StudioUtils';
	static SNS_PLUGIN_INSTALLATION_ERROR_MSG = 'ServiceNow Studio is not installed on instance.';
	static SNS_PLUGIN_ID = 'com.servicenow_studio';

	/**
	 * To check whether servicenow studio is installed or not
	 */
	static isSNStudioInstalled() {
		return GlidePluginManager.isActive(StudioUtils.SNS_PLUGIN_ID);
	}

	static getHomePageURL() {
		if (StudioUtils.isSNStudioInstalled()) return sn_sns.StudioUtils.STUDIO_HOMEPAGE;
		throw StudioUtils.SNS_PLUGIN_INSTALLATION_ERROR_MSG;
	}
	static getAppDetailsPageURL(appSysId) {
		if (StudioUtils.isSNStudioInstalled())
			return sn_sns.StudioUtils.getAppDetailsPageURL(appSysId);
		throw StudioUtils.SNS_PLUGIN_INSTALLATION_ERROR_MSG;
	}

	static getSNSPromotedActions() {
		const buildAgentPromotedActionProvider = new BuildAgentPromotedActionProvider();
		const actionsMap = buildAgentPromotedActionProvider.getPromotedActionsConfigMap();

		// Define promoted actions with their roles
		const snsPromotedActions = [
			{
				...actionsMap.createApp,
				roles: ['sn_g_app_creator.app_creator', ...(actionsMap.createApp.roles || [])],
			},
			{
				...actionsMap.updateApp,
				roles: ['delegated_developer', ...(actionsMap.updateApp.roles || [])],
			},
			{
				...actionsMap.createFile,
				roles: ['delegated_developer', ...(actionsMap.createFile.roles || [])],
			},
			{
				...actionsMap.updateFile,
				roles: ['delegated_developer', ...(actionsMap.updateFile.roles || [])],
			},
			{
				...actionsMap.summarizeApp,
				roles: ['delegated_developer', ...(actionsMap.summarizeApp.roles || [])],
			},
			{
				...actionsMap.addAgentToApp,
			},
		];

		return buildAgentPromotedActionProvider.filterPromotedActionsByAccess(snsPromotedActions);
	}

	static getIDEPromotedActions() {
		const buildAgentPromotedActionProvider = new BuildAgentPromotedActionProvider();
		const actionsMap = buildAgentPromotedActionProvider.getPromotedActionsConfigMap();

		const idePromotedActions = [
			actionsMap.createApp,
			actionsMap.updateApp,
			actionsMap.createFile,
			actionsMap.updateFile,
			actionsMap.summarizeApp,
			actionsMap.addAgentToApp,
		];

		return buildAgentPromotedActionProvider.filterPromotedActionsByAccess(idePromotedActions);
	}
}
