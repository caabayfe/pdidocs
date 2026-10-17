var GenAIABtesting = Class.create();
GenAIABtesting.prototype = {
    initialize: function() {
    },

    process: function(values, executionId) {
		var result = {
            "Models": {},
            "Winner": NowLLM,
            "Winner Score": 99
        };
		
        return result;
    },

    type: 'GenAIABtesting'
};
