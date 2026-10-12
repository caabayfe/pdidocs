var ExperimentFeedBackResponse = Class.create();
ExperimentFeedBackResponse.prototype = {
    initialize: function() {
        this.errorMessage = '';
    },

    setErrorMessage: function(msg) {
        this.errorMessage = msg;
		return this;
    },

    getErrorMessage: function() {
        return this.errorMessage;
    },

    type: 'ExperimentFeedBackResponse'
};
