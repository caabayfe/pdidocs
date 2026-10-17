class AppDetailsHelper {
	static SCOPE_TABLE = 'sys_scope';

	/**
	 * Checks if the given application is compatible with Creator Studio.
	 *
	 * @param {Object} gr - The GlideRecord instance to interact with the database.
	 * @param {string} appSysId - The system ID of the application being checked.
	 * @returns {boolean} - Returns true if the application is compatible, otherwise false.
	 */
	static isAppCompatibleWithCRS(gr, appSysId) {
		const udcConfig = sn_udc.ExperienceConfiguration;
		const taxonomyType = SNSConstants.SYS_APP_TABLE;
		const studio = udcConfig.ExperienceType.CreatorStudio;

		try {
			if (!udcConfig.isUserAuthorizedFor(studio)) {
				return false;
			}
			if (
				!udcConfig.IsAppCreatedInStudio({
					gr,
					ideCreated: SNSConstants.IDE_CREATED_CRS,
					sysId: appSysId,
				})
			) {
				return false;
			}

			if (!udcConfig.isBuilderConfigWithURLExists(taxonomyType, studio)) {
				return false;
			}
		} catch (error) {
			gs.error(`Error parsing isAppCompatibleWithCRS: ${error.message}`);
			return false;
		}

		return true;
	}

	/**
	 * Determines whether the given application was created using the IDE.
	 *
	 * @param {Object} gr - The GlideRecord instance to interact with the database.
	 * @param {string} appSysId - The system ID of the application being checked.
	 * @returns {boolean} - Returns true if the application was created using the IDE, otherwise false.
	 */
	static isAppCompatibleWithIDE(gr, appSysId) {
		const udcConfig = sn_udc.ExperienceConfiguration;
		try {
			if (
				!udcConfig.IsFluentApp({
					gr,
					sysId: appSysId,
				})
			) {
				return false;
			}
		} catch (error) {
			gs.error(`Error parsing isAppCompatibleWithIDE: ${error.message}`);
			return false;
		}

		return true;
	}
}
