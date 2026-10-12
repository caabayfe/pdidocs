/* eslint-disable no-unused-vars */

/**
 * Hereinafter the configuration for the UIB side panel properties
 * This function is being called by the now-ui json[scriptedConfigPolicy]
 * @param api - Contains the methods to controls the state of the properties
 * @param trigger - The current property changed action
 * @param properties - The properties and their values
 */
function policy({api, trigger, properties}) {
	if (trigger === 'hideSecondaryAction' || !trigger)
		api.updateVisibility('secondaryBtnLabel', !properties.hideSecondaryAction);
	if (trigger === 'hideSaveSignature' || !trigger)
		api.updateVisibility('saveSignatureChecked', !properties.hideSaveSignature);
}
