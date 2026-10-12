/* eslint-disable no-unused-vars */

/**
 * Scripted policy for config panel.
 * @param {PolicyInvokerParams<SnDashboard.Props>} parameters
 */
function applyPolicies({api, properties}) {
	if (!api.isDynamic('hideHeader') && properties.hideHeader) {
		api.updateVisibility('hideDashboardPicker', false);
		api.updateVisibility('hideShareButton', false);
		api.updateVisibility('hideEditButton', false);
		api.updateVisibility('hideCreateNewButton', false);
	} else {
		api.updateVisibility('hideDashboardPicker', true);
		api.updateVisibility('hideShareButton', true);
		api.updateVisibility('hideEditButton', true);
		api.updateVisibility('hideCreateNewButton', true);
	}

	if (properties.useDataBroker === true) {
		api.updateVisibility('data', true);
	} else {
		api.updateVisibility('data', false);
	}
}
