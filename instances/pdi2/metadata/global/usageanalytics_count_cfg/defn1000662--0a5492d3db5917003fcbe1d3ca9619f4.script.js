var data = {};
var totalClientErrors = 0;
var numClientErrors;

var ga = new GlideAggregate('sys_atf_test_result_item');
ga.addQuery('type', 'client_error');
ga.addAggregate('COUNT', 'summary');
ga.query();
while (ga.next()) {
    numClientErrors = parseInt(ga.getAggregate('COUNT', 'summary'));
    data[ga.summary] = numClientErrors;
    totalClientErrors += numClientErrors;
}

data['count'] = totalClientErrors;
answer = JSON.stringify(data);
