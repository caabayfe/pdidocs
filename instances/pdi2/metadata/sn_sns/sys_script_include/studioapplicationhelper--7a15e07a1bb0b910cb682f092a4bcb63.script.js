class StudioApplicationHelper {
	static type = 'StudioApplicationHelper';
	static PLUG_IN_TABLE = 'sys_plugin_log';

	static getIllustration(logoAttachmentFile) {
		if (!gs.nil(logoAttachmentFile)) return '/' + logoAttachmentFile;

		return '';
	}

	/**
	 * Check if app is publishable
	 * @param applicationSysId
	 * @param className
	 * @returns {boolean}
	 */
	static isAppPublishable(applicationSysId, className, isAppCustomizationEnabled) {
		const classNameMap = {
			[SNSConstants.SYS_APP_TABLE]: true,
			[SNSConstants.SYS_STORE_APP_TABLE]:
				isAppCustomizationEnabled &&
				sn_app_customization.AppCustomizationAPI.isAppCustomizationCapableById(
					applicationSysId
				),
		};
		return classNameMap[className] || false;
	}
}
