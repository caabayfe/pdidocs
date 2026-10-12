var NLQVisualization = Class.create();
NLQVisualization.prototype = {
    initialize: function() {
    },
	getVisualizationConfigurations: function(request) {
		var result = new SNC.NLQVisualizationGenerator().getVisualizationConfigurations(request);
		return result;
	},
	execute: function(inputs) { 
		var origin = "NOW_ASSIST";
    	var user_question = inputs.user_question.toString();
		var suggestions = user_question.split(' ').map(item => ({
			value: item
		}));
		var force_table_grammar = inputs.force_table_grammar;
		var table = inputs.table;

		var request = {
			'origin': origin,
			'user_question': user_question,
			'suggestions': suggestions,
			'force_table_grammar': force_table_grammar,
			'table': table
		};
		var result = this.getVisualizationConfigurations(JSON.stringify(request));
		return {
			"output": {
				"result": result
			}
        };
	},
    type: 'NLQVisualization'
};
