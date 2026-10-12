var WdfApi = Class.create();
WdfApi.prototype = {
    initialize: function() {
        this.logger = new WdfLogger();
    },

    executeConfigurations: function(startDate, endDate) {
        this.logger.debug("Executing WDF configurations");
        try {
            var configurationExecutor = new sn_wdf_token.ConfigurationExecutor();
            return configurationExecutor.executeConfigurations(startDate, endDate);
        } catch (e) {
            this.logger.error("Failed to execute WDF configurations: " + e);
            return;
        }
    },

    syncConfigurations: function() {
        var configurations;

        try {
            var store = new sn_wdf_token.LicensingStore();
            configurations = store.getConfigurations();
        } catch (e) {
            this.logger.error("Failed to fetch WDF configurations: " + e);
            return;
        }

        if (configurations == null || configurations.length <= 0) {
            this.logger.warn("No configuration data found.");
            return;
        }

        try {
            var configurationUtil = new sn_wdf_token.ConfigurationStore();
            return configurationUtil.processConfigurations(configurations);
        } catch (e) {
            this.logger.error("Failed to persist configurations: " + e);
        }
    },

    instanceHasWdfEntitlement: function() {
       return new sn_wdf_token.WdfDashboardUtil().instanceHasWdfEntitlement();
    },

    getEarliestStartDate: function() {
        return new sn_wdf_token.WdfDashboardUtil().getEarliestStartDate();
    },

    type: 'WdfApi'
};
