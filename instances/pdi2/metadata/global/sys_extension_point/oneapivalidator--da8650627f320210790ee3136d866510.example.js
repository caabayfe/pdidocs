var OneApiValidator = Class.create();
OneApiValidator.prototype = {
    initialize: function() {
    },

    executeRequestValidator: function(definitionId, inputs) {
        return inputs;
    },

	executeResponseValidator: function(definitionId, outputs) {
        return outputs;
    },

    type: 'OneApiValidator'
};
