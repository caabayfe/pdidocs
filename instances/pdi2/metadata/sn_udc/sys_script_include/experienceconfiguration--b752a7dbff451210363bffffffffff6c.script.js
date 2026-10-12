class ExperienceConfiguration {
	static Table = 'sn_udc_experience_configuration';
	static VisibilityControlTable = 'sn_udc_experience_visibility_control';
	static Column = {
		ExperienceType: 'experience_type',
		ExperienceConfiguration: 'experience_configuration',
		IsPluginAvailable: 'is_plugin_available',
		Order: 'order',
		Label: 'label',
		Description: 'description',
		Logo: 'logo',
		Url: 'url',
		AvailableForRoles: 'available_for_roles',
		NotAvailableForRoles: 'not_available_for_roles',
		DefaultAvailableForRoles: 'default_available_for_roles',
		DefaultNotAvailableForRoles: 'default_not_available_for_roles',
	};

	static ExperienceType = {
		CreatorStudio: 'creator_studio',
		ServiceNowStudio: 'servicenow_studio',
		ServiceNowIDE: 'servicenow_ide',
	};

	static ApplicationSource = {
		ServiceNowIDE: 'IDE',
		CreatorStudio: 'CS',
	};

	static AppTable = 'sys_scope';
	static TaxonomyBuilderConfigTable = 'sn_udc_file_taxonomy_builder_config';
	static FileTaxonomyBuilderTable = 'sn_udc_file_taxonomy_builder';

	static AllowDiscoveryPageProperty = 'sn_udc.allow_experience_discovery_pages';

	/**
	 * Check if the user is authorized to access the discovery page
	 * * @returns {boolean} true if user is authorized, else false
	 */
	static isExperienceDiscoveryAllowed() {
		return JSON.parse(
			gs.getProperty(ExperienceConfiguration.AllowDiscoveryPageProperty, 'true')
		);
	}

	/**
	 * Validate whether experience is available or not.
	 * @param experienceType
	 * @returns {boolean} true if experience is available, false otherwise
	 */
	static isExperienceAvailable(experienceType) {
		var expConfigGr =
			ExperienceConfiguration.getExperienceConfigBasedOnPluginAvailability(experienceType);
		return expConfigGr.getRowCount() !== 0;
	}

	/**
	 * Validate whether user is authorized to view the experience or not.
	 * @param {string} experienceType
	 * @returns {boolean} true if user is authorized for the experience, else false
	 */
	static isUserAuthorizedFor(experienceType) {
		var expConfigGr =
			ExperienceConfiguration.getExperienceConfigBasedOnPluginAvailability(experienceType);

		if (expConfigGr.next()) {
			const { availableForRoles, notAvailableForRoles } =
				ExperienceConfiguration.#getRolesForExperienceType(expConfigGr);
			return ExperienceConfiguration.#isUserAuthorized(
				availableForRoles,
				notAvailableForRoles
			);
		}
		return false;
	}

	/**
	 * Get the list of experiences available for the user.
	 * @returns {Array} list of experiences
	 */
	static getExperienceList() {
		const experiences = [];
		const authorizedStudioBuilders = [];
		const buildersWithoutEditPath = [];
		const experienceRecords = ExperienceConfiguration.#getRecordsByExperienceType();

		// Loop through all experiences
		Object.keys(experienceRecords).forEach(experienceType => {
			const configRecord = experienceRecords[experienceType];
			const allowDiscoveryPages = ExperienceConfiguration.isExperienceDiscoveryAllowed();

			if (configRecord.isPluginAvailable) {
				const userAuthorized = ExperienceConfiguration.#isUserAuthorized(
					configRecord.availableForRoles,
					configRecord.notAvailableForRoles
				);
				if (userAuthorized) {
					authorizedStudioBuilders.push(configRecord.id);
					experiences.push(configRecord);
				}
			} else {
				if (allowDiscoveryPages) experiences.push(configRecord);
			}
		});
		const editPathAvailabilityMap = this.#getEditPathAvailabilityMap(authorizedStudioBuilders);
		Object.keys(editPathAvailabilityMap).forEach(studioBuilder => {
			if (editPathAvailabilityMap[studioBuilder])
				editPathAvailabilityMap[studioBuilder] = [
					'all',
				]; // Need to add 'all' if  studioBuilder has editPath configured in builder properties
			else buildersWithoutEditPath.push(studioBuilder);
		});
		const configuredTypesMap = this.#generateOpenableTypesMap(buildersWithoutEditPath);
		return experiences.map(experience => {
			const openableTypes =
				editPathAvailabilityMap[experience.id] || configuredTypesMap[experience.id];
			return {
				id: experience.id,
				logo: experience.logo,
				label: experience.label,
				description: experience.description,
				url: experience.url,
				openableTypes: Array.isArray(openableTypes) ? openableTypes : [],
			};
		});
	}

	/**
	 * Returns configuration record for the experience
	 * @param {String} experienceType
	 * @param {boolean} isPluginAvailable
	 * @returns {GlideRecord} configuration record for given experience and plugin availability
	 */
	static getExperienceConfigBasedOnPluginAvailability(experienceType, isPluginAvailable = true) {
		var expConfigGr = new GlideRecordSecure(ExperienceConfiguration.Table);
		expConfigGr.addQuery(ExperienceConfiguration.Column.ExperienceType, experienceType);
		expConfigGr.addQuery(ExperienceConfiguration.Column.IsPluginAvailable, isPluginAvailable);
		expConfigGr.setLimit(1);
		expConfigGr.query();

		return expConfigGr;
	}

	/**
	 * Returns configuration override record based on configuration record sys_id
	 * @param {String} experienceConfiguration
	 * @returns {GlideRecord} configuration overide record
	 */
	static getExperienceVisibilityRecord(experienceConfiguration) {
		var gr = new GlideRecordSecure(ExperienceConfiguration.VisibilityControlTable);
		gr.addQuery(
			ExperienceConfiguration.Column.ExperienceConfiguration,
			experienceConfiguration
		);
		gr.setLimit(1);
		gr.query();

		return gr;
	}

	/**
	 * Returns configuration override record for a given experience type
	 * @param {String} experienceType
	 * @returns {GlideRecord} configuration overide record for given experience
	 */
	static #getExperienceVisibilityRecordBasedOnType(experienceType) {
		var gr = new GlideRecordSecure(ExperienceConfiguration.VisibilityControlTable);
		gr.addQuery(
			`${ExperienceConfiguration.Column.ExperienceConfiguration}.${ExperienceConfiguration.Column.ExperienceType}`,
			experienceType
		);
		gr.setLimit(1);
		gr.query();

		return gr;
	}

	/**
	 * @returns {Object} list of experience records by type
	 */
	static #getRecordsByExperienceType() {
		const result = {};
		var gr = new GlideRecord(ExperienceConfiguration.Table);
		gr.orderBy(ExperienceConfiguration.Column.Order);
		gr.orderBy(ExperienceConfiguration.Column.IsPluginAvailable);
		gr.query();

		while (gr.next()) {
			if (!gr.canRead()) continue;
			const experienceType = gr.getValue(ExperienceConfiguration.Column.ExperienceType);
			const isPluginAvailable =
				gr.getValue(ExperienceConfiguration.Column.IsPluginAvailable) === '1';

			let availableForRoles = [];
			let notAvailableForRoles = [];

			if (isPluginAvailable) {
				const roles = ExperienceConfiguration.#getRolesForExperienceType(gr);
				availableForRoles = roles.availableForRoles;
				notAvailableForRoles = roles.notAvailableForRoles;
			}

			result[experienceType] = {
				isPluginAvailable,
				order: gr.getValue(ExperienceConfiguration.Column.Order),
				id: experienceType,
				label: gr.getDisplayValue(ExperienceConfiguration.Column.Label),
				description: gr.getDisplayValue(ExperienceConfiguration.Column.Description),
				logo: gr.getValue(ExperienceConfiguration.Column.Logo),
				url: gr.getValue(ExperienceConfiguration.Column.Url),
				availableForRoles,
				notAvailableForRoles,
			};
		}
		return result;
	}

	/**
	 * Validates whether user is authorized for the given roles.
	 * @param {string[]} availableForRoles
	 * @param {string[]} notAvailableForRoles
	 * @returns {boolean} true if user is authorized, else false
	 */
	static #isUserAuthorized(availableForRoles = [], notAvailableForRoles = []) {
		const userRoles = gs.getUser().getRoles() || [];

		// User is not authorized, if user has any role which is part of `not_available_for_roles`
		const isUserInNotAvailableList = notAvailableForRoles.some(role => {
			return userRoles.includes(role);
		});
		if (isUserInNotAvailableList) return false;

		const isUserInAvailableList = availableForRoles.some(role => {
			return gs.hasRole(role);
		});

		return isUserInAvailableList;
	}

	/**
	 * Get the roles for the given experience type
	 * @param {GlideRecord} expConfigGr of ExperienceConfiguration
	 * @returns {Object} list of roles
	 */
	static #getRolesForExperienceType(expConfigGr) {
		// Parse default roles from the experience configuration record
		let { availableForRoles, notAvailableForRoles } =
			ExperienceConfiguration.#parseDefaultRoles(expConfigGr);

		const rolesOverrideGr = ExperienceConfiguration.#getExperienceVisibilityRecordBasedOnType(
			expConfigGr.getValue(ExperienceConfiguration.Column.ExperienceType)
		);
		if (rolesOverrideGr.next()) {
			({ availableForRoles, notAvailableForRoles } =
				ExperienceConfiguration.#parseUserConfiguredRoles(rolesOverrideGr));
		}

		return {
			availableForRoles,
			notAvailableForRoles,
		};
	}

	/**
	 * Parse default roles from the expereince_configuration record
	 * @param {GlideRecord} recordGr
	 * @returns {Object} list of roles
	 */
	static #parseDefaultRoles(recordGr) {
		return {
			availableForRoles: ExperienceConfiguration.#parseRolesFromRecord(
				recordGr,
				ExperienceConfiguration.Column.DefaultAvailableForRoles
			),
			notAvailableForRoles: ExperienceConfiguration.#parseRolesFromRecord(
				recordGr,
				ExperienceConfiguration.Column.DefaultNotAvailableForRoles
			),
		};
	}

	/**
	 * Parse user configured roles from experience_visibility_control record
	 * @param {GlideRecord} recordGr
	 * @returns {Object} list of roles
	 */
	static #parseUserConfiguredRoles(recordGr) {
		return {
			availableForRoles: ExperienceConfiguration.#parseRolesFromRecord(
				recordGr,
				ExperienceConfiguration.Column.AvailableForRoles
			),
			notAvailableForRoles: ExperienceConfiguration.#parseRolesFromRecord(
				recordGr,
				ExperienceConfiguration.Column.NotAvailableForRoles
			),
		};
	}

	/**
	 * Parse roles from the given record
	 * @param {GlideRecord} recordGr
	 * @param {string} roleType
	 * @returns {string[]} list of roles
	 */
	static #parseRolesFromRecord(recordGr, roleType) {
		return recordGr.getDisplayValue(roleType)
			? recordGr
					.getDisplayValue(roleType)
					.split(',')
					.map(role => role.trim())
			: [];
	}

	/**
	 * Builds a GlideRecord query configuration for taxonomy builder settings.
	 *
	 * This static private method retrieves records from the `ExperienceConfiguration.TaxonomyBuilderConfigTable` table
	 * that match the provided taxonomy type and builder name, ensuring the records have an `edit_path` and are active.
	 *
	 * @private
	 * @static
	 * @param {string[]} type - An array of taxonomy type (table names) to filter the query.
	 * @param {string} builderName - The name of the builder to filter the query.
	 * @returns {GlideRecord} A GlideRecord object containing the results of the query.
	 * }
	 */
	static #queryBuilderConfig(type, builderName) {
		const gr = new GlideRecord(ExperienceConfiguration.TaxonomyBuilderConfigTable);
		gr.addQuery('taxonomy_type.table', type);
		gr.addQuery('builder.name', builderName);
		gr.addNotNullQuery('edit_path');
		gr.addActiveQuery();
		gr.query();
		return gr;
	}

	/**
	 * Checks if a builder configuration with a URL exists for the given taxonomy type and studio.
	 *
	 * @static
	 * @param {string[]} type - An array of taxonomy type (table names) to filter the query.
	 * @param {string} studio - The name of the studio to map to a builder name.
	 * @returns {boolean} `true` if a matching builder configuration with a URL exists, `false` otherwise.
	 */
	static isBuilderConfigWithURLExists(type, studio) {
		if (!type || !studio) return false;
		const gr = this.#queryBuilderConfig(type, studio);
		if (gr.hasNext()) return true;

		const editPathAvailabilityMap = this.#getEditPathAvailabilityMap([studio]);
		return editPathAvailabilityMap[studio];
	}

	/**
	 * Generates a map of configured taxonomy types for the specified studio builders.
	 *
	 * This method retrieves records from the `ExperienceConfiguration.TaxonomyBuilderConfigTable` table,
	 * associates each builder with its corresponding taxonomy types, and constructs a mapping of builder names
	 * to their configured taxonomy type table names.
	 *
	 * @private
	 * @param {string[]} studioBuilders - An array of builder names for which the configured taxonomy types are to be fetched.
	 * @returns {Object<string, string[]>} - A map where each key is a builder name and the value is an array of taxonomy type table names associated with that builder.
	 */
	static #generateOpenableTypesMap(studioBuilders) {
		const configuredTypesMap = {};

		var gr = new GlideRecord(ExperienceConfiguration.TaxonomyBuilderConfigTable);
		gr.addQuery('builder.name', 'IN', studioBuilders);
		gr.query();

		while (gr.next()) {
			const builderRecord = gr.builder.getRefRecord();
			if (!UDCUtil.isValidGlideRecord(builderRecord)) continue;
			const builderName = builderRecord.getValue('name');
			const taxonomyTypeRecord = gr.taxonomy_type.getRefRecord();
			if (!taxonomyTypeRecord) continue;
			const taxonomyTypeTableName = taxonomyTypeRecord.getValue('table');
			if (configuredTypesMap[builderName])
				configuredTypesMap[builderName].push(taxonomyTypeTableName);
			else configuredTypesMap[builderName] = [taxonomyTypeTableName];
		}
		return configuredTypesMap;
	}
	/**
	 * Checks if the application was created in the studio.
	 *
	 * @param {Object} params - The parameters object.
	 * @param {GlideRecord} params.gr - The GlideRecord object for the application. If not provided, a new GlideRecord will be created.
	 * @param {string} params.ideCreated - The value to compare with the 'ide_created' field.
	 * @param {string} params.sysId - The sys_id of the application record.
	 * @returns {boolean} - Returns true if the 'ide_created' field matches the provided ideCreated value, otherwise false.
	 */
	static IsAppCreatedInStudio({ gr, ideCreated, sysId }) {
		let appGr = gr;
		if (!appGr) {
			appGr = new GlideRecord(ExperienceConfiguration.AppTable);
			appGr.get(sysId);
		}
		return appGr.getValue('ide_created') === ideCreated;
	}
	/**
	 * Checks if the application is a Fluent App created in the ServiceNow IDE.
	 *
	 * @param {Object} params - The parameters object.
	 * @param {GlideRecord} params.gr - The GlideRecord object for the application. If not provided, a new GlideRecord will be created.
	 * @param {string} params.sysId - The sys_id of the application record.
	 * @returns {boolean} - Returns true if the application contains a `package_json` value or was created in the ServiceNow IDE, otherwise false.
	 */
	static IsFluentApp({ gr, sysId }) {
		let appGr = gr;
		if (!appGr) {
			appGr = new GlideRecord(ExperienceConfiguration.AppTable);
			appGr.get(sysId);
		}
		return (
			appGr.getValue('package_json') ||
			appGr.getValue('ide_created') ===
				ExperienceConfiguration.ApplicationSource.ServiceNowIDE
		);
	}

	/**
	 * Determines the edit path availability for a list of studio builders.
	 *
	 * This method retrieves builder properties for the specified studio builders, parses them,
	 * and checks whether the `editPath` property exists in the builder properties JSON.
	 *
	 * @private
	 * @param {string[]} studioBuilders - An array of builder names to evaluate for edit path availability.
	 * @returns {Object<string, boolean>} - A map where keys are builder names and values are booleans indicating
	 *                                      whether the `editPath` property is available (`true`) or not (`false`).
	 * @throws {Error} - Logs an error message if builder properties fail to parse.
	 */
	static #getEditPathAvailabilityMap(studioBuilders) {
		const editPathAvailabilityMap = {};
		const builderPropertiesMap = this.#fetchBuilderProperties(studioBuilders);

		for (const name in builderPropertiesMap) {
			const builderProperties = builderPropertiesMap[name];

			if (!builderProperties) {
				editPathAvailabilityMap[name] = false;
				continue;
			}

			try {
				const builderPropertiesJSON = JSON.parse(builderProperties);
				editPathAvailabilityMap[name] = builderPropertiesJSON.hasOwnProperty('editPath');
			} catch (error) {
				gs.error(`Failed to parse Builder Properties for ${name}: ${error.message}`);
				editPathAvailabilityMap[name] = false;
			}
		}

		return editPathAvailabilityMap;
	}

	/**
	 * Fetches builder properties for the specified studio builders from the `sn_udc_file_taxonomy_builder` table.
	 *
	 * This method queries the table for active records where the `name` field matches any of the provided `studioBuilders`,
	 * and maps each builder's name to its associated `builder_properties` value.
	 *
	 * @private
	 * @param {string[]} studioBuilders - An array of builder names to fetch properties for.
	 * @returns {Object<string, string>} - A map where the keys are builder names and the values are their corresponding builder properties.
	 */
	static #fetchBuilderProperties(studioBuilders) {
		const builderPropertiesMap = {};
		const gr = new GlideRecord(ExperienceConfiguration.FileTaxonomyBuilderTable);
		gr.addQuery('name', 'IN', studioBuilders);
		gr.addActiveQuery();
		gr.query();

		while (gr.next()) {
			const name = gr.getValue('name');
			builderPropertiesMap[name] = gr.getValue('builder_properties');
		}

		return builderPropertiesMap;
	}
}
