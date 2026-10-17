var ExperimentationAPI = Class.create();
ExperimentationAPI.prototype = {
    initialize: function () {
        this.experimentService = new ExperimentService();
    },

    recordFeedback: function (experimentRequest) {
       return this.experimentService.recordFeedback(experimentRequest);
    },

    getContext: function (experimentRequest) {
        return this.experimentService.getContext(experimentRequest);
    },

    getFeatureFlagHiddenRecords: function (sourceTable) {
        return this.experimentService.getFeatureFlagHiddenRecords(sourceTable);
    },

    type: 'ExperimentationAPI'
};
