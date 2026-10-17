var minutesAgo = 1440; // 24 hours
var testResultGR = new GlideAggregate('sys_atf_test_result');
testResultGR.addQuery('sys_created_on', '>=', gs.minutesAgo(minutesAgo));
testResultGR.query();
answer = testResultGR.getRowCount();
