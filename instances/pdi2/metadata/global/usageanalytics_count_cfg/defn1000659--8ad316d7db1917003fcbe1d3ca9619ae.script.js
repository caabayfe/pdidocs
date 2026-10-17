var ga = new GlideAggregate('sys_atf_test_result');
ga.addAggregate('COUNT', 'status');
ga.query();
var data = {};
var totalTestResults = 0;
var numResults;
while (ga.next()) {
	numResults = parseInt(ga.getAggregate('COUNT', 'status'));
	data[ga.status] = numResults;
	totalTestResults += numResults;
}

ga.initialize();
ga.addQuery('pin', true);
ga.addAggregate('COUNT');
ga.query();
data['retain_indefinitely'] = ga.next() ? parseInt(ga.getAggregate('COUNT')) : 0;

ga.initialize();
ga.addAggregate('AVG', 'run_time');
ga.query();
data['avg_run_time'] = ga.next() ? ga.getAggregate('AVG', 'run_time') : null;

data['count'] = totalTestResults;
answer = JSON.stringify(data);
