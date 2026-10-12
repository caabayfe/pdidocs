var ProcessingFrameworkUtil = Class.create();
ProcessingFrameworkUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    getMaxAllowedJobCount: function() {
        var queueProvider = this.getParameter("sysparm_queueProvider");
        var processingOrder = this.getParameter("sysparm_processingOrder");
        if (JSUtil.nil(queueProvider) || JSUtil.nil(processingOrder))
            return 1;

        return new SNC.ProcessingFrameworkUtil().getMaxJobsAllowed(processingOrder,
            queueProvider);
    },

    getDuration: function() {
        var repeatInterval = this.getParameter("sysparm_repeatInterval");
        if (JSUtil.nil(repeatInterval))
            return '0 00:00:30';
        var duration = new GlideDuration();
        duration.setValue(repeatInterval);
        return duration.getDurationValue();
    },

    getProvider: function(queueGr) {
        var provider = 'Event Provider';
        if (queueGr.provider)
            provider = queueGr.provider.getRefRecord().name;
        return provider;
    },

	canRollback: function(current) {
		// Check user permissions first
		var hasPermission = gs.hasRole('maint') || (gs.hasRole('events_admin') && current.sys_policy != 'read');
		if (!hasPermission) {
			return false;
		}

		// Check if automatic processing is enabled
		if (!current.automatic_processing) {
			return false;
		}

		// Check if processing framework is enabled
		var frameworkEnabled = gs.getProperty('com.glide.processing.framework.enabled', 'true') == 'true';
		if (!frameworkEnabled) {
			return false;
		}

		return true;
	},

    type: 'ProcessingFrameworkUtil'
});
