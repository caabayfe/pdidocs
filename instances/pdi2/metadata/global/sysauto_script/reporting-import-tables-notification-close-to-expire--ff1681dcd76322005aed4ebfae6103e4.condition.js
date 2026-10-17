// is there any temporary table that  expires in 2 or 1 days?
var ga = new GlideAggregate('sys_report_import_table');
ga.addAggregate('COUNT');
ga.addQuery('active','true');
var qc2 = ga.addQuery('expire_on_date', gs.daysAgo(-2)); // 2 days
qc2.addOrCondition('expire_on_date', gs.daysAgo(-1)); // 1 days
ga.query();
ga.next();
ga.getAggregate('COUNT') !== '0'
