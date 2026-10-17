/**
 * Hereinafter the configuration for the UIB side panel properties
 * This function is being called by the now-ui json[scriptedConfigPolicy]
 * @param api - Contains the methods to controls the state of the properties
 * @param trigger - The current property changed action
 * @param properties - The properties and their values
 */
function policy(args) {
	args.api.updateVisibility('compactMode', false);
	args.api.updateVisibility('usingMonolith', false);
}
