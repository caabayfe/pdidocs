var minutesAgo = 43200; // base system setting in minutes: 2592000 / 60
var flushOlderThanGR = new GlideAggregate('sys_auto_flush');
flushOlderThanGR.addQuery('sys_name','sys_atf_test_result');
flushOlderThanGR.query();
if (flushOlderThanGR.next() && !isNaN(flushOlderThanGR.age))
  minutesAgo = Math.max(1, flushOlderThanGR.age / 60);
var testResultGR = new GlideAggregate('sys_atf_test_result');
testResultGR.addQuery('sys_created_on', '>=', gs.minutesAgo(minutesAgo));
testResultGR.query();
answer = testResultGR.getRowCount();
