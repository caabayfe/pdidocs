/**
 * Hereinafter the configuration for the UIB side panel properties
 * This function is being called by the now-ui json[scriptedConfigPolicy]
 * @param api - Contains the methods to controls the state of the properties
 * @param trigger - The current property changed action
 * @param properties - The properties and their values
 */
function policy({ api, trigger, properties }) {
	//eslint-disable-line no-unused-vars

	function updateFieldsOnSelectTargetCreationSource(
		api,
		targetCreationSource
	) {
		if (targetCreationSource === 'targetUUID') {
			api.updateVisibility('uuid', true);
			api.updateVisibility('indicatorsList', false);
			api.updateVisibility('breakdownElementInfo', false);
		} else {
			api.updateVisibility('uuid', false);
			api.updateVisibility('indicatorsList', true);
			api.updateVisibility('breakdownElementInfo', true);
		}
	}

	/**
	 * Handling Pre-Utah where `Target Creation Source` configuration field did not exist,
	 * so we need to make sure we populate that field accordingly
	 *
	 * @param {*} api
	 * @param {*} properties
	 */
	function updateTargetCreationSource(api, properties) {
		let targetCreationSource = properties.targetCreationSource; // default value is 'targetUUID'

		if (properties.indicatorsList.length > 0) {
			targetCreationSource = 'kpiList';
			api.updateValue('targetCreationSource', targetCreationSource);
		}

		updateFieldsOnSelectTargetCreationSource(api, targetCreationSource);
	}

	function showBaselineConfigOptions(api, configOptions) {
		if (configOptions.indexOf('averageScore') > -1) {
			api.updateVisibility('averageScore', true);
		} else {
			api.updateVisibility('averageScore', false);
		}

		if (configOptions.indexOf('previousTarget') > -1) {
			api.updateVisibility('additionalBaselineFilter', true);
		} else {
			api.updateVisibility('additionalBaselineFilter', false);
		}
	}

	/**
	 * Handling Pre-Utah where baselineConfigOptions used to be a string, instead of array
	 * For some weird reason, UIB returns the properties.baselineConfigOptions as null even if
	 * the macroponent file has the correct value for 'baselineConfigOptions'.
	 * To go around that, we can check on whether 'averageScore' or 'additionalBaselineFilter' is populated
	 *
	 * @param {*} api
	 * @param {*} properties
	 */
	function updateBaselineConfigOptions(api, properties) {
		let configOptions = properties.baselineConfigOptions || [];

		if (
			properties.averageScore &&
			configOptions.indexOf('averageScore') <= -1
		) {
			configOptions.push('averageScore');
		}

		if (
			properties.additionalBaselineFilter &&
			configOptions.indexOf('previousTarget') <= -1
		) {
			configOptions.push('previousTarget');
		}

		api.updateValue('baselineConfigOptions', configOptions);

		showBaselineConfigOptions(api, configOptions);
	}

	if (!trigger) {
		updateTargetCreationSource(api, properties);
		updateBaselineConfigOptions(api, properties);
	}

	if (trigger === 'targetCreationSource') {
		updateFieldsOnSelectTargetCreationSource(
			api,
			properties.targetCreationSource
		);
	}

	if (trigger === 'baselineConfigOptions') {
		showBaselineConfigOptions(api, properties.baselineConfigOptions || []);
	}
}
