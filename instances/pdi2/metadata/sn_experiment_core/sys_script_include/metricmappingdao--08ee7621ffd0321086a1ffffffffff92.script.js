var MetricMappingDao = Class.create();
MetricMappingDao.prototype = {
    initialize: function() {
        this.TABLE_NAME = "sn_experiment_core_metric_mapping";
    },

    getMetricMappingBySysId: function(sysId) {
        if (!sysId) {
            gs.warn("MetricMappingDao.getMetricMappingBySysId: sysId is required");
            return null;
        }

        var gr = new GlideRecord(this.TABLE_NAME);
        if (gr.get(sysId)) {
            return new MetricMappingDao().initializeWithGr(gr);
        }
        return null;
    },

    getMetricMappingByDefinitionId: function(definitionId) {
        if (!definitionId) {
            gs.warn("MetricMappingDao.getMetricMappingByDefinitionId: definitionId is required");
            return null;
        }

        var gr = new GlideRecord(this.TABLE_NAME);
        gr.addQuery("definition_id", definitionId);
        gr.query();

        if (gr.next()) {
            return new MetricMapping().initializeWithGr(gr);
        }
        return null;
    },

    getMetricMappingsByExperimentId: function(experimentId) {
        if (!experimentId) {
            gs.warn("MetricMappingDao.getMetricMappingByExperimentId: experimentId is required");
            return null;
        }

        var gr = new GlideRecord(this.TABLE_NAME);
        gr.addQuery("experiment", experimentId);
        gr.query();

        var metricMappings = [];
        while (gr.next()) {
            var metricMapping = new MetricMapping().initializeWithGr(gr);
            if (metricMapping) {
                metricMappings.push(metricMapping);
            }
        }
        return metricMappings;
    },

    saveMetricMapping: function(metricMapping) {
        if (!metricMapping || typeof metricMapping !== "object") {
            gs.error("MetricMappingDao.saveMetricMapping: Valid MetricMapping object is required");
            return null;
        }

        try {
            var gr = new GlideRecord(this.TABLE_NAME);
            var sysId = metricMapping.getSysId();
            var isUpdate = gr.get(sysId);

            if (!isUpdate) {
                gr.initialize();
                if (sysId) gr.setNewGuidValue(sysId);
            }

            gr.setValue("definition_id", metricMapping.getDefinitionId());
            gr.setValue("metadata", metricMapping.getMetadata());

            // Reference
            gr.setValue("experiment", metricMapping.getExperiment());

            var savedSysId = gr.update();
            return savedSysId || gr.getUniqueValue();
        } catch (error) {
            gs.error("MetricMappingDao.saveMetricMapping: " + error.message);
            return null;
        }
    },

    type: "MetricMappingDao",
};
