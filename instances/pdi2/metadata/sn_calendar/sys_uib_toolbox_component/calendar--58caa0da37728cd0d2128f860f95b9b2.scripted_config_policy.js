/**
 * Hereinafter the configuration for the UIB side panel properties
 * This function is being called by the now-ui json[scriptedConfigPolicy]
 * @param api - Contains the methods to controls the state of the properties
 * @param trigger - The current property changed action
 * @param properties - The properties and their values
 */
function policy(args) { //eslint-disable-line no-unused-vars
	const {api, trigger, properties} = args; 
	const popoverEnabled = properties.popoverEnabled === true;
	if (!trigger || trigger === 'popoverEnabled') 
		api.updateVisibility('popoverContentState', popoverEnabled);

	const hideKeyboardShortcuts = properties.hideKeyboardShortcuts === true;    
	if (!trigger || trigger === 'hideKeyboardShortcuts') 
		api.updateVisibility('hotkeys', !hideKeyboardShortcuts);
}
