var UpdateCmdbModelLifecyclePhaseChoiceLabels = Class.create();
UpdateCmdbModelLifecyclePhaseChoiceLabels.prototype = {
	initialize: function() {},

	process: function() {
		var TABLE = 'cmdb_model_lifecycle';
		var ELEMENT = 'lifecycle_phase';
		var LANGUAGE = 'en';
		var expectedLabels = {
			availability: 'General availability',
			end_of_sale: 'End of sale',
			end_of_support: 'End of support',
			end_of_extended_support: 'End of extended support',
			end_of_life: 'End of life',
		};
		Object.keys(expectedLabels).forEach(function(phaseValue) {
			var gr = new GlideRecord('sys_choice');
			gr.addQuery('name', TABLE);
			gr.addQuery('element', ELEMENT);
			gr.addQuery('language', LANGUAGE);
			gr.addQuery('value', phaseValue);
			gr.query();
			while (gr.next()) {
				gr.setValue('label', expectedLabels[phaseValue]);
				gr.update();
			}
		});
	},

	type: 'UpdateCmdbModelLifecyclePhaseChoiceLabels',
};
