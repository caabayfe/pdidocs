//#region definitions
/**
 * @typedef {'INTERACTIVE'|'SCHEDULED'|'RECOMPUTATION'} PopulatorMode
 */
//#endregion

var ServiceCalculationDispatcher = Class.create();
ServiceCalculationDispatcher.prototype = {
	/**
	 * @param {PopulatorMode} mode
	 */
	initialize: function(mode) {
		this.mode = mode || 'INTERACTIVE';
	},

	/**
	 * @param {GlideRecord} serviceGr
	 */
	dispatch: function(serviceGr) {
		var serviceId = serviceGr.getUniqueValue();
		if (ModellessServiceCoreUtils.isLightweight(serviceId)) {
			gs.debug('ServiceCalculationDispatcher: service ' + serviceId + ' routed to LightweightServiceManager');
			new sn_sm_scoped_app.LightweightServiceManager().recalculateServicesSync([serviceId]);
		} else {
			gs.debug('ServiceCalculationDispatcher: service ' + serviceId + ' routed to ServicePopulatorRunner');
			new SNC.ServicePopulatorRunner(this.mode).run(serviceGr);
		}
	},

	type: 'ServiceCalculationDispatcher'
};
