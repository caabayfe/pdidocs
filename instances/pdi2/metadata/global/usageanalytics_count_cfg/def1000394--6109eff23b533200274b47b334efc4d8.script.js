answer = JSON.stringify(cancelledSolutionsPerTemplate());

function cancelledSolutionsPerTemplate() {
	if (!haveRequiredTables())
		return 0;

	var obj = {};

	// Total cancelled solution count
	var count = 0;
	var ga = new GlideAggregate('ml_solution');
	ga.addAggregate('COUNT');
	ga.addQuery('state', 'solution_cancelled');
	ga.addQuery('sys_created_on', '>=', gs.daysAgo(1));
	ga.query();
	if (ga.next()) {
		count = ga.getAggregate('COUNT');
	}
	obj.count = count;

	// Cancelled solutions per template type
	var solution_capability = [];
	ga = new GlideAggregate('ml_solution');
	ga.addAggregate('COUNT', 'solution_definition.trainer.name');
	ga.addQuery('state', 'solution_cancelled');
	ga.addQuery('sys_created_on', '>=', gs.daysAgo(1));
	ga.query();
	while (ga.next()) {
		var capability = {};
		capability.count = ga.getAggregate('COUNT', 'solution_definition.trainer.name');
		capability.capability = ga.getValue('solution_definition.trainer.name');
		solution_capability.push(capability);
	}
	obj.solution_capability = solution_capability;

	// Cancelled solutions per template record
	var solution_template = [];
	ga = new GlideAggregate('ml_solution');
	ga.addAggregate('COUNT', 'solution_definition.trainer');
	ga.addQuery('state', 'solution_cancelled');
	ga.addQuery('sys_created_on', '>=', gs.daysAgo(1));
	ga.query();
	while (ga.next()) {
		var template = {};
		var gr = new GlideRecord('ml_trainer_definition');
		if (!gr.get(ga.getValue('solution_definition.trainer')))
			continue;

		template.count = ga.getAggregate('COUNT', 'solution_definition.trainer');
		template.capability = gr.getValue('name');
		template.label = gr.getValue('label');
		template.version = gr.getValue('version');
		solution_template.push(template);
	}
	obj.solution_template = solution_template;

	return obj;
}

function haveRequiredTables() {
	return GlideTableDescriptor.isValid('ml_solution') && GlideTableDescriptor.isValid('ml_solution_definition') && GlideTableDescriptor.isValid('ml_trainer_definition');
}
