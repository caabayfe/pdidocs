var ga = new GlideAggregate('sys_atf_step');
ga.addAggregate('COUNT', 'step_config');
ga.query();
var data = {};
var totalNumSteps = 0;
var numStepConfigs;
while (ga.next()) {
	numStepConfigs = parseInt(ga.getAggregate('COUNT', 'step_config'));
	data[ga.step_config.name] = numStepConfigs;
	totalNumSteps += numStepConfigs;
}

ga.initialize();
ga.addQuery('active', true);
ga.addAggregate('COUNT');
ga.query();
data['num_active_steps'] = ga.next() ? parseInt(ga.getAggregate('COUNT')) : 0;

data['count'] = totalNumSteps;
answer = JSON.stringify(data);
