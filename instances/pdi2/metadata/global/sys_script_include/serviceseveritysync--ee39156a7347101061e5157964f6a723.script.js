var ServiceSeveritySync = Class.create();
ServiceSeveritySync.prototype = {

    initialize: function() {},

    syncSeverityOfMonitoredServices: function() {
        var grCmdbCiServiceAuto = new GlideRecord("cmdb_ci_service_auto");
        var servicesBatch = {};
		var servicesBatchNames = {};
		
        var maxBatchSize = 500;
        var maxServicesToChange = 15000;
        var currBatchSize = 0;
        grCmdbCiServiceAuto.addQuery("operational_status", 1);
        grCmdbCiServiceAuto.query();
        if (grCmdbCiServiceAuto.getRowCount() > maxServicesToChange)
            gs.warn("ServiceSeveritySync: The number of services to check has reached the maximum limit (15,000 Services).");
        else {
            // for every monitored operational service
            while (grCmdbCiServiceAuto.next()) {
                // batching services
                if (currBatchSize < maxBatchSize) {
                    servicesBatch[grCmdbCiServiceAuto.getUniqueValue()] = grCmdbCiServiceAuto.getValue("severity");
                    servicesBatchNames[grCmdbCiServiceAuto.getUniqueValue()] = grCmdbCiServiceAuto.getValue("name");
                    currBatchSize++;
                    continue;
                }
                this.checkAndSyncServices(servicesBatch, servicesBatchNames);
                servicesBatch = {};
                currBatchSize = 0;
            }
            this.checkAndSyncServices(servicesBatch, servicesBatchNames);
        }
    },

    checkAndSyncServices: function(servicesBatch, servicesBatchNames) {
        var servicesNotFoundInImpact = {};
        for (var i in servicesBatch) {
            servicesNotFoundInImpact[i] = '';
        }

        var time = new GlideDateTime();
        var severity;
        var serviceSysId;
        var grEmImpactStatus = new GlideRecord("em_impact_status");
        grEmImpactStatus.addQuery("element_id", Object.keys(servicesBatch));
        grEmImpactStatus.addQuery("vt_end", ">=", time);
        grEmImpactStatus.query();
        // for every record in impact status
        while (grEmImpactStatus.next()) {
            // we are interested only in the records of business services (query brings also records 'service'-'connected service')
            if (grEmImpactStatus.getValue("element_id") != grEmImpactStatus.getValue("business_service"))
                continue;
            severity = grEmImpactStatus.getValue("severity");
            serviceSysId = grEmImpactStatus.getValue("business_service");
            // check their severities and change accordingly
            if (servicesBatch[serviceSysId] != severity) {
                this.fixSeverityInServiceTable(serviceSysId, severity, servicesBatchNames[serviceSysId]);
            }

            // mark that service was found in impact
            delete servicesNotFoundInImpact[serviceSysId];
        }

        // go over services that does not appear in em_impact_status and verify that they have severity "OK"
        for (var serviceSysIdIterator in servicesNotFoundInImpact) {
            if (servicesBatch[serviceSysIdIterator] != '5') {
                this.fixSeverityInServiceTable(serviceSysIdIterator, '5', servicesBatchNames[serviceSysIdIterator]);
            }

        }

    },


    fixSeverityInServiceTable: function(serviceSysId, severity, serviceName) {
        var gr = new GlideRecord("cmdb_ci_service_auto");
        gr.get("sys_id", serviceSysId);
        gs.error("ServiceSeveritySync: The severity of the service " + serviceName + " " + serviceSysId +
            " in cmdb_ci_service_auto was changed from " + gr.getValue("severity") + " to " + severity +
            " because it was not synced with em_impact_status.");
        gr.setValue("severity", severity);
        gr.update();
    },



    type: 'ServiceSeveritySync'
};
