class StudioApplicationService {
	static type = 'StudioApplicationService';
	static IS_APP_CUSTOMIZATION_ENABLED =
		sn_app_customization.AppCustomizationAPI.isAppCustomizationFeatureEnabled();
	static SOURCE_CONTROL_REMOTE_DEFAULT_BRANCH = gs.getProperty(
		'glide.source_control.git_default_branch',
		'main'
	);
	static IS_APP_SUMMARIZATION_DISABLED =
		gs.getProperty('sn_sns.is_app_summarization_disabled', 'false') === 'true';
	//TODO: Need to add favourites and collections details
	/**
	 * Get sys app info properties
	 * @returns {Object} of applications
	 */
	static getSysAppInfoProperties(applicationSysId) {
		var sysAppInfoGr = new GlideRecord(SNSConstants.SYS_APP_INFO_TABLE);
		const isSysAppInfoGrFound = sysAppInfoGr.get('sys_scope', applicationSysId);
		try {
			if (isSysAppInfoGrFound) {
				const properties = sysAppInfoGr.getValue('properties');
				return JSON.parse(properties);
			}
		} catch (error) {
			gs.error(`Failed to parse properties JSON: ${error.message}`);
		}
		return null;
	}

	static isAppGeneratedFromAI(recordUniqueValue) {
		var sysAppInfoProperties =
			StudioApplicationService.getSysAppInfoProperties(recordUniqueValue);

		let isGeneratedFromAI = false;
		try {
			if (sysAppInfoProperties?.ai_sysids) {
				const ai_sysids = JSON.parse(sysAppInfoProperties?.ai_sysids);
				isGeneratedFromAI = ai_sysids?.length > 0 || false;
			}
		} catch (error) {
			gs.error(`Failed to parse ai_sysids JSON: ${error.message}`);
		}

		return isGeneratedFromAI;
	}

	static isCollaborationPluginActive() {
		const PLUGIN_ID = 'com.snc.collaboration-request';
		return GlidePluginManager.isActive(PLUGIN_ID);
	}

	/**
	 * Get all the applications
	 * @returns {Object} of applications
	 */
	static getAppDetails(appSysId) {
		var record = new GlideRecord(SNSConstants.SCOPE_TABLE);
		record.addQuery('sys_id', appSysId);
		record.query();

		if (record.next()) {
			if (record.canRead()) {
				const className = record.getRecordClassName();

				let canSummarize = false;
				if (
					!StudioApplicationService.IS_APP_SUMMARIZATION_DISABLED &&
					className !== SNSConstants.SYS_STORE_APP_TABLE &&
					StudioPermissionService.getUserPermissions(appSysId).canUpdateAppProperties &&
					sn_udc.UDCGenAIUtils.isAppSummaryEnabled()
				) {
					canSummarize = true;
				}

				const isCollaborationPluginActive =
					StudioApplicationService.isCollaborationPluginActive();

				return {
					sysId: record.getUniqueValue(),
					appName: record.getValue('name'),
					version: record.getValue('version') || '',
					shortDescription: record.getDisplayValue('short_description'),
					scopeName: record.getValue('scope'),
					isPrivateApp: record.getValue('private') === '1',
					isAppCompatibleWithCRS: AppDetailsHelper.isAppCompatibleWithCRS(
						record,
						appSysId
					),
					isAppCompatibleWithIDE: AppDetailsHelper.isAppCompatibleWithIDE(
						record,
						appSysId
					),
					dateCreated: record.getValue('sys_created_on'),
					scope:
						record.getValue('scope') == SNSConstants.GLOBAL_APPLICATION_SCOPE_NAME
							? 'Global'
							: 'Scoped',
					icon: StudioApplicationHelper.getIllustration(record.getDisplayValue('logo')),
					className: className,
					appCustomizationVersion:
						className === SNSConstants.SYS_STORE_APP_TABLE
							? sn_app_customization.AppCustomizationAPI.getAppCustomizationVersionById(
									appSysId
							  ) || ''
							: '',
					isPublishable: StudioApplicationHelper.isAppPublishable(
						appSysId,
						className,
						StudioApplicationService.IS_APP_CUSTOMIZATION_ENABLED
					),
					isAppCustomizationEnabled:
						StudioApplicationService.IS_APP_CUSTOMIZATION_ENABLED,
					canDelete: record.canDelete(),
					isGeneratedFromAI: StudioApplicationService.isAppGeneratedFromAI(
						record.getUniqueValue()
					),
					canSummarize: canSummarize,
					isCollaborationPluginActive: isCollaborationPluginActive,
					remoteDefaultBranchName:
						StudioApplicationService.SOURCE_CONTROL_REMOTE_DEFAULT_BRANCH,
				};
			}

			return {
				statusCode: 403,
				error: SNSConstants.errors.APP_ACCESS_ERROR_MESSAGE,
			};
		}
		return {
			statusCode: 404,
			error: SNSConstants.errors.APP_DOES_NOT_EXISTS + ' : ' + appSysId,
		};
	}
}
