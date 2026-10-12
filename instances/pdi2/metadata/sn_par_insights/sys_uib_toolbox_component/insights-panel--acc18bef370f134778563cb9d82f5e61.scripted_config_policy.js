/* eslint-disable no-unused-vars */
// @ts-nocheck
/**
 * Hereinafter the configuration for the UIB side panel properties
 * This function is being called by the now-ui json[scriptedConfigPolicy]
 */
function policy(args) {
	/**
	 * If Analytics Source Edit view is Selected then  will be showing option for Analytics source sys Id
	 *
	 * @param {*} api
	 * @param {*} properties
	 */
	function updatePOProjectIdVisibility(api, properties) {
		api.updateVisibility('poProjectIDs', properties.showProcessMining === true);
	}

	//eslint-disable-line no-unused-vars
	const {api, trigger, properties} = args;

	if (
		!trigger ||
		(trigger === 'showProcessMining' &&
			Object.keys(properties).includes('showProcessMining'))
	) {
		updatePOProjectIdVisibility(api, properties);
	}
}
