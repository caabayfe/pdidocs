/**
 * Hereinafter the configuration for the UIB side panel properties
 * This function is being called by the now-ui json[scriptedConfigPolicy]
 * @param api - Contains the methods to controls the state of the properties
 * @param trigger - The current property changed action
 * @param properties - The properties and their values
 */
function policy({ api, trigger, properties }) {
	if (!trigger || trigger === 'activityView') {
		var enableShowFilteredCount = properties.activityView === 'stacked';
		api.updateVisibility('showFilteredCount', enableShowFilteredCount);
	}

	api.updateVisibility('compactMode', false);
	api.updateVisibility('usingMonolith', false);
}
