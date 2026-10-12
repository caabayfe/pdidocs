
/**
 * Hereinafter the configuration for the UIB side panel properties
 * This function is being called by the now-ui json[scriptedConfigPolicy]
 * @param api - Contains the methods to controls the state of the properties
 * @param trigger - The current property changed action
 * @param properties - The properties and their values
 */
function policy({api, trigger, properties: p}) { //eslint-disable-line no-unused-vars
	/**
	 * Syncing properties that need to show/hide depending on the choosen layout.
	 */

	const choice = p['mode'];

	switch (choice) {
		case 'manual':
			api.updateVisibility('items', true);
			api.updateVisibility('includeSysId', false);
			api.updateVisibility('allowDotWalking', false);
			api.updateVisibility('showVariables', false);
			api.updateVisibility('showExtendedFields', false);
			api.updateVisibility('tableName', false);
			api.updateVisibility('itemsRoot', true);
			api.updateVisibility('showSelectedItemPath', true);
			break;
		case 'tableDescription':
			api.updateVisibility('items', false);
			api.updateVisibility('includeSysId', true);
			api.updateVisibility('allowDotWalking', true);
			api.updateVisibility('showVariables', true);
			api.updateVisibility('showExtendedFields', true);
			api.updateVisibility('tableName', true);
			api.updateVisibility('itemsRoot', false);
			api.updateVisibility('showSelectedItemPath', false);
			break;
		default:
			break;
	}
}
