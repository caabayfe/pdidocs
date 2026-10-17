var PortalPerformanceUtilSNC = Class.create();

// Class-level constants for various statuses
PortalPerformanceUtilSNC.LESS_DETAILED_VIEW = 'less_detailed_view';
PortalPerformanceUtilSNC.HEAVY_USAGE_MESSAGE = gs.getMessage("We're currently experiencing heavy usage. Try again later.");

PortalPerformanceUtilSNC.prototype = {
	// Initialization method (currently empty)
	initialize: function() {},

	/**
	 * Check if the node is under heavy load by querying the NodeServiceSaturation.
	 * @returns {boolean} True if the UI thread pool is saturated, False otherwise.
	 */
	isNodeUnderHeavyLoad: function() {
		var saturated = false;
		try {
			saturated = NodeServiceSaturation.isUIThreadPoolSaturated();
		} catch (error) {
			saturated = false;
		}
		return saturated;
	},

	/**
	 * Evaluate content optimization based on provided options.
	 * @param {Object} options - Widget option for widget behavior during high load.
	 * @returns {Object} Result containing whether to show optimized content and a message.
	 */
	evaluateContentOptimization: function(options) {
		var result = {
			showOptimizedContent: false,
		};
		if (!options) return result;

		if (options.widget_behavior_during_high_load && PortalPerformanceUtilSNC.LESS_DETAILED_VIEW === options.widget_behavior_during_high_load) {
			if (this.getNodeStatus() || this.getLiveEventStatus()) {
				result.showOptimizedContent = true;
				result.message = PortalPerformanceUtilSNC.HEAVY_USAGE_MESSAGE;
				return result;
			}
		}
		return result;
	},

	/**
	 * Get the current status of the node's health.
	 * @returns {boolean} True if the node is under heavy load, False otherwise.
	 */
	getNodeStatus: function() {
		var session = gs.getSession();
		var uiThreadSaturated = session.getClientData('node_health_status');

		if (uiThreadSaturated) {
			uiThreadSaturated = this.isNodeUnderHeavyLoad().toString();
			session.putClientData('node_health_status', uiThreadSaturated);
		}
		return uiThreadSaturated === 'true';
	},

	/**
	 * Check if a live event is happening. Currently returns False.
	 * @returns {boolean} True if a live event is happening, False otherwise.
	 */
	getLiveEventStatus: function() {
		var liveEventHappening = false;
		var isContentDeliveryActive = new GlidePluginManager().isActive('com.sn_content_delivery');
		if (isContentDeliveryActive) {
			var lessDetailedView = gs.getProperty(sn_cd.cd_CommonConstants.HIGH_TRAFFIC_EVENT_DEGRADED_EXPERIENCE) === PortalPerformanceUtilSNC.LESS_DETAILED_VIEW;
			var cacheManager = new sn_cd.cd_CompanyEventCacheManager();
			if (lessDetailedView && typeof cacheManager.getCurrSurgeEvents !== 'undefined' && cacheManager.getCurrSurgeEvents()) {
				liveEventHappening = true;
			}
		}
		return liveEventHappening;
	},

	type: 'PortalPerformanceUtilSNC',
};
