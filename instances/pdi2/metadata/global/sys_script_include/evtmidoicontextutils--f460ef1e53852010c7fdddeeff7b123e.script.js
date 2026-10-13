var EvtMidOiContextUtils = Class.create();
EvtMidOiContextUtils.prototype = {
    initialize: function() {},

    validateContextCanStart: function(midID) {
        var canStart = false;

        canStart = this.checkClothoConfig() && this.checkClusterConfig(midID);

        return canStart;
    },

    checkClusterConfig: function(midId) {
        var igniteUp = false;

        var rec = new GlideRecord("ecc_agent_distributed_cluster_node");
        rec.addQuery("agent", midId);
        rec.query();

        if (rec.next()) {
            igniteUp = true;

        }

        if (!igniteUp) {
            message = gs.getMessage("No cluster node found. Ensure that the distribued cluster is properly configured.");
            gs.addErrorMessage(message);
        }

        return igniteUp;
    },
	
	checkClothoConfig: function() {
        var clotho = new GlideRecord("sys_service_endpoint");
        var message = '';
        var hasClotho = false;

        // Quebec+ instances
        if (clotho.isValid()) {
            var res = sn_internal_services.ServiceConfig.getServiceHealth('MetricBase');
            gs.log(' MetricBase Health : ' + res["health"]);
            if (res["health"] === 'green') {
                hasClotho = true;
            } else {
                message = gs.getMessage("There is no MetricBase record in the sys_service table.");
                gs.addErrorMessage(message);
            }
        } else { // Pre Quebec instances
            clotho = new GlideRecord("sys_clotho_config");
            clotho.query();
            if (clotho.hasNext()) {
                hasClotho = true;
            } else {
                message = gs.getMessage("MetricBase is not configured on the instance. Verify the MetricBase configuration.");
                gs.addErrorMessage(message);
            }
        }

        return hasClotho;
    },

    type: 'EvtMidOiContextUtils'
};
