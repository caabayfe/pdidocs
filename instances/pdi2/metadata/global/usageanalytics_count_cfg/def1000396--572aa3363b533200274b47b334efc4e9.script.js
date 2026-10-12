answer = JSON.stringify(predictionsPerTemplate());

function predictionsPerTemplate() {
	if (!haveRequiredTables())
		return 0;

	var obj = {};

	// Total finished prediction count
	var count = 0;
	var ga = new GlideAggregate('ml_predictor_results');
	ga.addAggregate('COUNT');
	ga.addQuery('final_value_date', '>=', gs.daysAgo(1));
	ga.query();
	if (ga.next()) {
		count = ga.getAggregate('COUNT');
	}
	obj.count = count;

	// Finished predictions per template type
	var solution_capability = [];
	ga = new GlideAggregate('ml_predictor_results');
	ga.addAggregate('COUNT', 'solution.solution_definition.trainer.name');
	ga.addQuery('final_value_date', '>=', gs.daysAgo(1));
	ga.query();
	while (ga.next()) {
		var capability = {};
		capability.count = ga.getAggregate('COUNT', 'solution.solution_definition.trainer.name');
		capability.capability = ga.getValue('solution.solution_definition.trainer.name');
		solution_capability.push(capability);
	}
	obj.solution_capability = solution_capability;

	// Finished predictions per template record
	var solution_template = [];
	ga = new GlideAggregate('ml_predictor_results');
	ga.addAggregate('COUNT', 'solution.solution_definition.trainer');
	ga.addQuery('final_value_date', '>=', gs.daysAgo(1));
	ga.query();
	while (ga.next()) {
		var template = {};
		var gr = new GlideRecord('ml_trainer_definition');
		if (!gr.get(ga.getValue('solution.solution_definition.trainer')))
			continue;

		template.count = ga.getAggregate('COUNT', 'solution.solution_definition.trainer');
		template.capability = gr.getValue('name');
		template.label = gr.getValue('label');
		template.version = gr.getValue('version');
		solution_template.push(template);
	}
	obj.solution_template = solution_template;

	// Finished predictions per solution definition record
	var solution_definition = [];
   	ga = new GlideAggregate('ml_predictor_results');
   	ga.addAggregate('COUNT', 'solution.solution_definition');
	ga.addQuery('final_value_date', '>=', gs.daysAgo(1));
	ga.query();
	while (ga.next()) {
		var definition = {};
		var gr = new GlideRecord('ml_solution_definition');
		if (!gr.get(ga.getValue('solution.solution_definition')))
			continue;

		definition.count = ga.getAggregate('COUNT', 'solution.solution_definition');
		definition.name = gr.getValue('solution_name');
		definition.label = gr.getValue('solution_label');
		solution_definition.push(definition);
    }
    obj.solution_definition = solution_definition;

	return obj;
}

function haveRequiredTables() {
	return GlideTableDescriptor.isValid('ml_predictor_results') && GlideTableDescriptor.isValid('ml_solution') && GlideTableDescriptor.isValid('ml_solution_definition') && GlideTableDescriptor.isValid('ml_trainer_definition');
}
