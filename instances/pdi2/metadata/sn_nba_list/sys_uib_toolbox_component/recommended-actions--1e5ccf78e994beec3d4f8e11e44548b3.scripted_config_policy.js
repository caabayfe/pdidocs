/**
 * Hereinafter the configuration for the UIB side panel properties
 * This function is being called by the now-ui json[scriptedConfigPolicy]
 * @param api - Contains the methods to controls the state of the properties
 * @param trigger - The current property changed action
 * @param properties - The properties and their values
 */
 function policy(args) { //eslint-disable-line no-unused-vars
	const {api, trigger, properties} = args; 
	const grouping = properties.grouping === true;
	const hideHeading = properties.hideHeading === true;
	const hideRecommendationTab = properties.hideRecommendationTab === true;
	const hideSearchTab = properties.hideSearchTab === true;
	const hideTabs = properties.hideTabs === true;
	if (!trigger || trigger === 'grouping') 
		api.updateVisibility('groupingProperties', grouping);
	if (!trigger || trigger === 'hideHeading') 
		api.updateEnabled('heading', !hideHeading);
	if (!trigger || trigger === 'hideRecommendationTab' || trigger === 'hideSearchTab'){
		api.updateEnabled('recommendationTab', (!hideRecommendationTab && !hideSearchTab));
		api.updateEnabled('searchTab', (!hideRecommendationTab && !hideSearchTab));
		api.updateEnabled('recommendationPlaceOrder', (!hideRecommendationTab && !hideSearchTab));
		api.updateEnabled('searchPlaceOrder', (!hideRecommendationTab && !hideSearchTab));
	}
	if (!trigger || trigger === 'hideTabs') 
		api.updateEnabled('historyTitle', !hideTabs);

	if (trigger === 'recommendationPlaceOrder' && properties['recommendationPlaceOrder']) {
		if(properties['recommendationPlaceOrder'] == 1){
			api.updateValue('searchPlaceOrder', 2);
		}
		else{
			api.updateValue('searchPlaceOrder', 1);
		}
	}
    if (trigger === 'searchPlaceOrder' && properties['searchPlaceOrder']) {
		if(properties['searchPlaceOrder'] == 1){
			api.updateValue('recommendationPlaceOrder', 2);
		}
		else{
			api.updateValue('recommendationPlaceOrder', 1);
		}
	}

}
