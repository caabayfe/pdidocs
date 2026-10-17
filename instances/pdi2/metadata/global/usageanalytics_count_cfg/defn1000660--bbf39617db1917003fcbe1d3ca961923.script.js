var ga = new GlideAggregate('sys_atf_step');
ga.addAggregate('COUNT', 'step_config.category.name');
ga.query();
var data = {};
var totalNumSteps = 0;
var numStepConfigs;
while (ga.next()) {
	numStepConfigs = parseInt(ga.getAggregate('COUNT', 'step_config.category.name'));
	data[ga.getValue('step_config.category.name')] = numStepConfigs;
	totalNumSteps += numStepConfigs;
}

data['count'] = totalNumSteps;
answer = JSON.stringify(data);
