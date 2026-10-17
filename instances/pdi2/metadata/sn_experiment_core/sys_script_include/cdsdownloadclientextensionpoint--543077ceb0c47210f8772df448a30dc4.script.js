var CDSDownloadClientExtensionPoint = Class.create();
CDSDownloadClientExtensionPoint.prototype = {
    initialize: function() {},

    /**
     * Checks if extension point is valid for given table name, only the first applicable extension point will run
     * @param {string} table - name of client-side table who we are downloading data for
     * @returns {boolean} if extension point is applicable to that table
     */
    isApplicable: function(table) {
        return table == CDSClientConstants.TABLE_CLIENT_STAGING;
    },

    /**
    * Runs function given metadata before table is updated for each page of data
    * @param {Object} metadata - object storing metadata returned by server
    * 
    * Example metadata:
    * {
    *   topologyChange: true,                  // boolean: true if topology changed, false otherwise
    *   updatedTime: "2025-10-21T10:30:00Z",   // ISO datetime string of last update
    *   instanceType: "prod"                   // can be "prod", "subprod", or "demonstration"
    * }
    */
    beforeUpdate: function(metadata) {
       try {
           if (!metadata) {
             gs.error("Metadata is missing from the server side");
             return;
            }

           if (!metadata.topologyChange) {
              gs.info("Topology change is false, skipping update and deletion.");
              return;
            }

           this.updateClientRegistry(metadata);
           this.filterAndRemoveExperiments(metadata);

        } catch (error) {
            gs.error("Error occurred in beforeUpdate: " + error.message);
        }
    },



    /**
    * Updates the cds_client_registry record with the latest topology change timestamp
    */
    updateClientRegistry: function(metadata) {
        var record = new GlideRecord(CDSClientConstants.TABLE_CDS_CLIENT_REGISTRY);

        if (record.get(CDSClientConstants.SN_EXPERIMENT_CORE_EXPERIMENTATION_EXECUTOR_CLIENT_STAGING_SYS_ID)) {
            var newEntry = 'last_topology_change_received=' + metadata.updatedTime;
            var existingFilter = record.getValue(CDSClientConstants.FIELD_SERVER_FILTER_CRITERIA) || '';
            var parts = existingFilter ? existingFilter.split('^') : [];
            var filtered = parts.filter(function(part) {
                return part.indexOf('last_topology_change_received=') !== 0;
            });
            filtered.push(newEntry);

            var updatedFilter = filtered.join('^');

            record.setValue(CDSClientConstants.FIELD_SERVER_FILTER_CRITERIA, updatedFilter);
            record.update();
            gs.info("server_filter_criteria updated to: " + updatedFilter);

            this._clearExperimentStagingTable();
        } else {
            gs.error("Record with sys_id " + CDSClientConstants.SN_EXPERIMENT_CORE_EXPERIMENTATION_EXECUTOR_CLIENT_STAGING_SYS_ID + " not found.");
        }
    },

    /**
     * Deletes all experiments except those with instanceType = 'production' or the current instanceType
     */
    filterAndRemoveExperiments: function(metadata) {

        var expTable = CDSClientConstants.TABLE_EXPERIMENTS;
        var variantTable = CDSClientConstants.TABLE_VARIANT;
        var featureTable = CDSClientConstants.TABLE_FEATURE_FLAG;
        var segmentTable = CDSClientConstants.TABLE_SEGMENT;
        var metricMappingTable = CDSClientConstants.TABLE_METRIC_MAPPING;

        var expGR = new GlideRecord(expTable);
        var query = CDSClientConstants.FIELD_INSTANCE_TYPE + "!=" + CDSClientConstants.VALUE_PRODUCTION + "^" +
            CDSClientConstants.FIELD_INSTANCE_TYPE + "!=" + metadata.instanceType;
        expGR.addEncodedQuery(query);
        expGR.query();

        while (expGR.next()) {
            var expSysId = expGR.getValue('sys_id');
            var expName = expGR.getValue(CDSClientConstants.FIELD_NAME) || expSysId;
            var segmentSysId = expGR.getValue('segment');
            var featureFlagSysId = expGR.getValue('feature_flag');

            var metricGR = new GlideRecord(metricMappingTable);
            metricGR.addQuery('experiment', expSysId);
            metricGR.query();
            while (metricGR.next()) {
                gs.info("Deleting metric mapping for experiment: " + expName);
                metricGR.deleteRecord();
            }

            var variantGR = new GlideRecord(variantTable);
            var parentSysId = expSysId;

            variantGR.addQuery('parent_id', parentSysId);
            variantGR.query();
            while (variantGR.next()) {
                gs.info("Deleting variant: " + variantGR.getValue('name') + " under " + parentSysId);
                variantGR.deleteRecord();
            }

            var featureGR = new GlideRecord(featureTable);
            featureGR.addQuery('sys_id', featureFlagSysId);
            featureGR.query();
            while (featureGR.next()) {
                gs.info("Deleting feature flag: " + featureGR.getValue('name') + " linked to experiment " + expName);
                featureGR.deleteRecord();
            }

            if (segmentSysId) {
                var segGR = new GlideRecord(segmentTable);
                segGR.addQuery('sys_id', segmentSysId);
                segGR.query();
                while (segGR.next()) {
                    gs.info("Deleting segment: " + segGR.getValue('name') + " linked to experiment " + expName);
                    segGR.deleteRecord();
                }
            }

            expGR.deleteRecord();
            gs.info("Deleted experiment: " + expName + " (instanceType != production/" + metadata.instanceType + ")");
        }
    },
    /**
     * Helper method to delete all records from the experiment staging table
     */
    _clearExperimentStagingTable: function() {
        var gr = new GlideRecord(CDSClientConstants.TABLE_CLIENT_STAGING);
        gr.query();
        var count = 0;
        while (gr.next()) {
            gr.deleteRecord();
            count++;
        }
        gs.info('All records deleted from ' + CDSClientConstants.TABLE_CLIENT_STAGING + '. Total deleted: ' + count);
    },



    /**
     * Runs function given metadata after table is updated for each page of data
     * @param {Object} metadata - object storing metadata returned by server
     */
    afterUpdate: function(metadata) {
        var cdsProcessor = new sn_experiment_core.ExperimentCDSDataProcessor();
        cdsProcessor.processUnprocessedRecords();
        return;
    },

    type: 'CDSDownloadClientExtensionPoint'
};
