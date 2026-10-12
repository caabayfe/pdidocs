// @ts-nocheck
/**
 * Hereinafter the configuration for the UIB side panel properties
 * This function is being called by the now-ui json[scriptedConfigPolicy]
 * @param api - Contains the methods to controls the state of the properties
 * @param trigger - The current property changed action
 * @param properties - The properties and their values
 */
 function policy(args) {
	/**
	 * If Analytics Source Edit view is Selected then  will be showing option for Analytics source sys Id
	 *
	 * @param {*} api
	 * @param {*} properties
	 */
	function updateAnalyticsSourceSysIdInputVisibility(api, properties) {
		api.updateVisibility('analyticsSourceSysId', properties.analyticsSourceView == 'edit');
	}

	/**
	 * If Analytics Source Edit view is Selected then  will be showing option for Analytics source sys Id
	 *
	 * @param {*} api
	 * @param {*} properties
	 */
	 function updateAnalyticsSourceDuplicateInputVisibility(api, properties) {
		api.updateVisibility('duplicationInfo', properties.analyticsSourceView == 'edit');
	}

	//eslint-disable-line no-unused-vars
	const { api, trigger, properties } = args;

	if (!trigger || trigger === 'analyticsSourceView' && Object.keys(properties).includes('analyticsSourceView')) {
		updateAnalyticsSourceSysIdInputVisibility(api, properties);
		updateAnalyticsSourceDuplicateInputVisibility(api, properties);
	}
}
