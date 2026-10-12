var MetricMapping = Class.create();
MetricMapping.prototype = {
    initialize: function() {
        this.sysId = null;
        this.definitionId = null;
        this.metadata = null;
        // Reference
        this.experiment = null;
    },

    initializeWithGr: function(gr) {
        this.setSysId(gr.getUniqueValue())
            .setDefinitionId(gr.getValue("definition_id"))
            .setMetadata(gr.getValue("metadata"))
            .setExperiment(gr.getValue("experiment"))

        return this;
    },

    // --- Setters ---
    setSysId: function(sysId) {
        this.sysId = sysId;
        return this;
    },
    setDefinitionId: function(defId) {
        this.definitionId = defId;
        return this;
    },
    setMetadata: function(metadata) {
        this.metadata = metadata;
        return this;
    },
    setExperiment: function(experiment) {
        this.experiment = experiment;
        return this;
    },

    // --- Getters ---
    getSysId: function() {
        return this.sysId;
    },
    getDefinitionId: function() {
        return this.definitionId;
    },
    getMetadata: function() {
        return this.metadata;
    },
    getExperiment: function() {
        return this.experiment;
    },

    // --- JSON methods ---
    toJSON: function() {
        return {
            sysId: this.sysId,
            definitionId: this.definitionId,
            metadata: this.metadata,
            experiment: this.experiment
        };
    },

    type: 'MetricMapping'
};

MetricMapping.fromJSON = function(json) {
    if (!json || typeof json !== 'object') {
        throw new Error('Invalid JSON input for MetricMapping');
    }

    var metricMapping = new MetricMapping();
    if (json.sysId !== undefined) metricMapping.setSysId(json.sysId);
    if (json.definitionId !== undefined) metricMapping.setDefinitionId(json.definitionId);
    if (json.metadata !== undefined) metricMapping.setMetadata(json.metadata);
    if (json.experiment !== undefined) metricMapping.setExperiment(json.experiment);

    return metricMapping;
}
