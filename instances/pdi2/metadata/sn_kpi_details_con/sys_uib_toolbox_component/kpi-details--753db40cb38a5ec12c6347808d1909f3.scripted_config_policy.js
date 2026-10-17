/**
 * Hereinafter the configuration for the UIB side panel properties
 * This function is being called by the now-ui json[scriptedConfigPolicy]
 * @param api - Contains the methods to controls the state of the properties
 * @param trigger - The current property changed action
 * @param properties - The properties and their values
 */
function policy(args) {
	/**
	 * In Utah, the property 'KPI Details View' (kpiDetailsView) was changed from a dropdown (choicelist of 'Chart View' and ' Records View')
	 * to a toggle property named 'showRecordsView'. We just need to make sure that the new property showRecordsView is set to the
	 * old property's (kpiDetailsView) corresponding value
	 *
	 * @param {*} api
	 * @param {*} properties
	 */
	function updateKPIDetailViewToShowRecordsView(api, properties) {
		api.updateVisibility('kpiDetailsView', false);
		api.updateValue(
			'showRecordsView',
			properties.kpiDetailsView == 'recordsView'
		);
		api.updateVisibility('recordsListView', true);
	}

	/**
	 * In Utah, the property 'statisticsOrientation' was changed to 'showHorizontalStatisticOrientation'
	 * The property 'statisticsOrientation' was a dropdown with two choices: horizontal and vertical
	 * From Utah, the new property 'showHorizontalStatisticOrientation' is a toggle where ON means Horizontal orientation
	 *
	 * @param {*} api
	 * @param {*} properties
	 */
	function updateStatisticsOrientation(api, properties) {
		api.updateVisibility('statisticsOrientation', false);
		api.updateValue(
			'showHorizontalStatisticOrientation',
			properties.statisticsOrientation == 'horizontal'
		);
	}

	/**
	 * If toggle Show Records View is on, we show the Records List View configuration
	 *
	 * @param {*} api
	 * @param {*} properties
	 */
	function showRecordsListView(api, properties) {
		api.updateVisibility('recordsListView', properties.showRecordsView);
	}

	//eslint-disable-line no-unused-vars
	const { api, trigger, properties } = args;

	if (!trigger && Object.keys(properties).includes('kpiDetailsView')) {
		updateKPIDetailViewToShowRecordsView(api, properties);
	}

	if (!trigger && Object.keys(properties).includes('statisticsOrientation')) {
		updateStatisticsOrientation(api, properties);
	}

	if (!trigger || trigger === 'showRecordsView') {
		showRecordsListView(api, properties);
	}
}
