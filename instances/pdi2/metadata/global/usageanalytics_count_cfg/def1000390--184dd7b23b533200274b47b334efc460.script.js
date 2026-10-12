answer = JSON.stringify(solutionDefinitionsPerTemplate());

function solutionDefinitionsPerTemplate() {
	if (!haveRequiredTables())
		return 0;

	var obj = {};

	// Total solution definition count
	var count = 0;
	var ga = new GlideAggregate('ml_capability_definition_base');
	ga.addAggregate('COUNT');
	ga.addQuery('sys_created_on', '>=', gs.daysAgo(1));
	ga.query();
	if (ga.next()) {
		count = ga.getAggregate('COUNT');
	}
	obj.count = count;

	// Solution definitions per template type
	var solution_capability = [];
	ga = new GlideAggregate('ml_capability_definition_base');
	ga.addAggregate('COUNT', 'capability.value');
	ga.addQuery('sys_created_on', '>=', gs.daysAgo(1));
	ga.query();
	while (ga.next()) {
		var capability = {};
		capability.count = ga.getAggregate('COUNT', 'capability.value');
		capability.capability = ga.getValue('capability.value');
		solution_capability.push(capability);
	}
	obj.solution_capability = solution_capability;

	return obj;
}

function haveRequiredTables() {
	return GlideTableDescriptor.isValid('ml_capability_definition_base');
}
