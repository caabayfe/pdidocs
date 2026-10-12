/**
 * Hereinafter the configuration for the UIB side panel properties
 * This function is being called by the now-ui json[scriptedConfigPolicy]
 * @param api - Contains the methods to controls the state of the properties
 * @param trigger - The current property changed action
 * @param properties - The properties and their values
 */

// eslint-disable-next-line no-unused-vars
function policy({ trigger, api, properties }) {
	if (trigger === 'manageReorderRows' || !trigger) {
		const isManagingReorder = properties.manageReorderRows === true;

		api.updateEnabled('disableReorderRows', isManagingReorder);
	}

	if (trigger === 'manageColumnPersonalization' || !trigger) {
		properties.manageColumnPersonalization &&
			api.setPropertyValue('manageColumnShowHide', false);
		api.updateEnabled(
			'manageColumnShowHide',
			!properties.manageColumnPersonalization
		);
	}

	if (trigger === 'enableAddColumn' || !trigger) {
		api.updateEnabled('addColumnConfig', properties.enableAddColumn === true);
	}
}
