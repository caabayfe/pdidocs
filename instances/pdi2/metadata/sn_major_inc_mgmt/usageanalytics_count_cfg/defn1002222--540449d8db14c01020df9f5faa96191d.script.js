var gc = new GlideAggregate('cmdb_ci_outage');
gc.addQuery('task_number.sys_class_name', 'incident');
gc.addQuery('sys_created_onRELATIVEGE@dayofweek@ago@90');
gc.setCategory('usage');

var mi = gc.addJoinQuery('incident');
mi.setCategory('usage');
mi.addCondition('major_incident_state', 'accepted');

gc.addAggregate('count');
gc.query();
gc.next();

answer = gc.getAggregate('count');
