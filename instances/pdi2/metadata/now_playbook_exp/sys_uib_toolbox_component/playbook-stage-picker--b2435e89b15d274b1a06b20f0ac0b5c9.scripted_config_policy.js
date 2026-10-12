/**
 * Hereinafter the configuration for the UIB side panel properties
 * This function is being called by the now-ui json[scriptedConfigPolicy]
 * @param api - Contains the methods to controls the state of the properties
 * @param trigger - The current property changed action
 * @param properties - The properties and their values
 */
function policy({ api, trigger, properties }) {
	const maxVisibleStages = 'maxVisibleStages';

	if (!trigger || trigger === 'orientation') {
		var enableMaxVisibleStages =
			properties.orientation === 'horizontal' ||
			properties.orientation === 'horizontal with activity drawer';
		api.updateVisibility(maxVisibleStages, enableMaxVisibleStages);
	}

	if (trigger === maxVisibleStages && properties[maxVisibleStages] < 1)
		api.updateValue(maxVisibleStages, 1);

	api.updateVisibility('compactMode', false);
	api.updateVisibility('usingMonolith', false);
}
