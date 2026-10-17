var gc = new GlideRecord('cmdb_ci_outage');
gc.setCategory('usage');
gc.addQuery('task_number.sys_class_name', 'incident');
gc.addEncodedQuery('sys_created_onRELATIVEGE@dayofweek@ago@90');


var mi = gc.addJoinQuery('incident');
mi.addCondition('major_incident_state', 'accepted');
mi.setCategory('usage');
gc.query();

var count = gc.getRowCount();
var duration = 0;
while (gc.next()) {
	duration += gc.duration.dateNumericValue();
}


var avgDuration = duration / count;
var avgDurationInMinutes = Math.round(avgDuration / 60000);

answer = avgDurationInMinutes;
