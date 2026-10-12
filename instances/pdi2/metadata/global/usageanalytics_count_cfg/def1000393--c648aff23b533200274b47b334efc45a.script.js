answer = JSON.stringify(failedSolutionsPerTemplate());

function failedSolutionsPerTemplate() {
	if (!haveRequiredTables())
		return 0;

	var obj = {};

	// Total failed solution count
	var count = 0;
	var ga = new GlideAggregate('ml_solution');
	ga.addAggregate('COUNT');
	var stateQuery = ga.addQuery('state', 'solution_error');
	stateQuery.addOrCondition('state', 'unauthorized');
	stateQuery.addOrCondition('state', 'retry');
	stateQuery.addOrCondition('state', 'timed_out');
	ga.addQuery('sys_created_on', '>=', gs.daysAgo(1));
	ga.query();
	if (ga.next()) {
		count = ga.getAggregate('COUNT');
	}
	obj.count = count;

	// Failed solutions per template type
	var solution_capability = [];
	ga = new GlideAggregate('ml_solution');
	ga.addAggregate('COUNT', 'solution_definition.trainer.name');
	stateQuery = ga.addQuery('state', 'solution_error');
	stateQuery.addOrCondition('state', 'unauthorized');
	stateQuery.addOrCondition('state', 'retry');
	stateQuery.addOrCondition('state', 'timed_out');
	ga.addQuery('sys_created_on', '>=', gs.daysAgo(1));
	ga.query();
	while (ga.next()) {
		var capability = {};
		capability.count = ga.getAggregate('COUNT', 'solution_definition.trainer.name');
		capability.capability = ga.getValue('solution_definition.trainer.name');

		var states = {};
		var stateGA = new GlideAggregate('ml_solution');
		stateGA.addAggregate('COUNT', 'state');
		stateQuery = stateGA.addQuery('state', 'solution_error');
		stateQuery.addOrCondition('state', 'unauthorized');
		stateQuery.addOrCondition('state', 'retry');
		stateQuery.addOrCondition('state', 'timed_out');
		stateGA.addQuery('solution_definition.trainer.name', ga.getValue('solution_definition.trainer.name'));
		stateGA.addQuery('sys_created_on', '>=', gs.daysAgo(1));
		stateGA.query();
		while (stateGA.next()) {
			states[stateGA.getValue('state')] = stateGA.getAggregate('COUNT', 'state');
		}
		capability.states = states;

		solution_capability.push(capability);
	}
	obj.solution_capability = solution_capability;

	// Failed solutions per template record
	var solution_template = [];
	ga = new GlideAggregate('ml_solution');
	ga.addAggregate('COUNT', 'solution_definition.trainer');
	stateQuery = ga.addQuery('state', 'solution_error');
	stateQuery.addOrCondition('state', 'unauthorized');
	stateQuery.addOrCondition('state', 'retry');
	stateQuery.addOrCondition('state', 'timed_out');
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

		var states = {};
		var stateGA = new GlideAggregate('ml_solution');
		stateGA.addAggregate('COUNT', 'state');
		stateQuery = stateGA.addQuery('state', 'solution_error');
		stateQuery.addOrCondition('state', 'unauthorized');
		stateQuery.addOrCondition('state', 'retry');
		stateQuery.addOrCondition('state', 'timed_out');
		stateGA.addQuery('solution_definition.trainer', ga.getValue('solution_definition.trainer'));
		stateGA.addQuery('sys_created_on', '>=', gs.daysAgo(1));
		stateGA.query();
		while (stateGA.next()) {
			states[stateGA.getValue('state')] = stateGA.getAggregate('COUNT', 'state');
		}
		template.states = states;

		solution_template.push(template);
	}
	obj.solution_template = solution_template;

	return obj;
}

function haveRequiredTables() {
	return GlideTableDescriptor.isValid('ml_solution') && GlideTableDescriptor.isValid('ml_solution_definition') && GlideTableDescriptor.isValid('ml_trainer_definition');
}
