var ExperimentationContext = Class.create();
ExperimentationContext.prototype = {
    initialize: function() {
        this.experimentId = '';
        this.variant = '';
        this.value = '';
        this.type = '';
        this.errorMessage = '';
        this.events = '';
    },

    // Getter and Setter for experimentId
    getExperimentId: function() {
        return this.experimentId;
    },

    setExperimentId: function(experimentId) {
        this.experimentId = experimentId || '';
		return this;
    },

    // Getter and Setter for variant
    getVariant: function() {
        return this.variant;
    },

    setVariant: function(variant) {
        this.variant = (variant !== undefined && variant !== null) ? variant : '';
		return this;
    },

    // Getter and Setter for value
    getValue: function() {
        return this.value;
    },

    setValue: function(value) {
        this.value = (value !== undefined && value !== null) ? value : '';
		return this;
    },

    // Getter and Setter for type
    getType: function() {
        return this.type;
    },

    setType: function(type) {
        this.type = type || '';
		return this;
    },

    // Getter and Setter for errorMessage
    getErrorMessage: function() {
        return this.errorMessage;
    },

    setErrorMessage: function(errorMessage) {
        this.errorMessage = errorMessage || '';
		return this;
    },

    // Getter and Setter for events
    getEvents: function() {
        return this.events;
    },

    setEvents: function(events) {
        this.events = events || '';
        return this;
    },

    // Utility method to check if there's an error
    hasError: function() {
        return this.errorMessage && this.errorMessage.length > 0;
    },

    // Utility method to get all values as an object
    toObject: function() {
        return {
            experimentId: this.experimentId,
            variant: this.variant,
            value: this.value,
            type: this.type,
            errorMessage: this.errorMessage,
            events: this.events
        };
    },

    type: 'ExperimentationContext'
};
