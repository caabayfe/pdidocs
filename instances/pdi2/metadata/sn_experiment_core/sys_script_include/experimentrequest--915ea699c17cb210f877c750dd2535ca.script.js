var ExperimentRequest = Class.create();
ExperimentRequest.prototype = {
    initialize: function() {
        this.experimentKey = '';
        this.fallbackVariantValue = '';
        this.requestContext = {};
        this.data = {};
    },

    getExperimentKey: function() {
        return this.experimentKey;
    },

    setExperimentKey: function(experimentKey) {
        this.experimentKey = experimentKey;
        return this;
    },

    getFallbackVariantValue: function() {
        return this.fallbackVariantValue;
    },

    setFallbackVariantValue: function(fallbackVariantValue) {
        this.fallbackVariantValue = fallbackVariantValue;
        return this;
    },

    getRequestContext: function() {
        return this.requestContext;
    },

    setRequestContext: function(requestContext) {
        this.requestContext = requestContext;
        return this;
    },

    getData: function() {
        return this.data;
    },

    setData: function(data) {
        this.data = data;
        return this;
    },

    type: 'ExperimentRequest'
};

ExperimentRequest.fromJSON = function(json) {
    if (!json || typeof json !== 'object') {
        throw new Error('Invalid JSON input: expected an object');
    }

    var experimentRequest = new ExperimentRequest();

    if (json.experimentKey !== undefined && json.experimentKey !== null) experimentRequest.setExperimentKey(json.experimentKey);
    if (json.fallbackVariantValue !== undefined && json.fallbackVariantValue !== null) experimentRequest.setFallbackVariantValue(json.fallbackVariantValue);
    if (json.requestContext !== undefined && json.requestContext !== null) experimentRequest.setRequestContext(json.requestContext);
    if (json.data !== undefined && json.data !== null) experimentRequest.setData(json.data);

    return experimentRequest;
};

ExperimentRequest.fromKey = function(key, fallback = 'INVALID') {
    if (!key || key == undefined) {
        throw new Error('Key is required');
    }

    var experimentRequest = new ExperimentRequest();

    experimentRequest.setExperimentKey(key);
    experimentRequest.setFallbackVariantValue(fallback);

    return experimentRequest;
};
