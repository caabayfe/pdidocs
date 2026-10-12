/**
 * Hereinafter the configuration for the UIB side panel properties
 * This function is being called by the now-ui json[scriptedConfigPolicy]
 * @param api - Contains the methods to controls the state of the properties
 * @param trigger - The current property changed action
 * @param properties - The properties and their values
 */
// eslint-disable-next-line no-unused-vars
function policy({api, trigger, properties}) {
	if (!trigger || trigger === 'showSwimlaneAsRow') {
		api.updateVisibility('rowLaneHeaderTag', properties.showSwimlaneAsRow);
		api.updateVisibility('rowLaneConfig', properties.showSwimlaneAsRow);
	}
	if (!trigger || trigger === 'enableDependencyLines') {
		api.updateVisibility(
			'dependencyLines',
			properties.enableDependencyLines
		);
	}
}
