// Make sure business rules are running after the insertion.
var session = gs.getSession();
session.setWorkflow(true);
var tableName = 'sys_analytics_data_points_queue';
var rotations = 3;
var duration = '1970-01-02 00:00:00'; // copied from the existing value. This means 1
var gr = new GlideRecord('sys_table_rotation');
gr.addQuery('name', tableName);
gr.query();
if(gr.next()) {
	gs.info(getScriptName()+'The table rotation for '+ tableName+' table already exists. No record will be created');
}
else {
	gr.setWorkflow(true);
	gr.setValue('name', tableName);
	gr.setValue('duration', duration);
	gr.setValue('type', 'rotate');
	gr.setValue('rotations', rotations);
	var sysId = gr.insert();
	gs.info(getScriptName()+'The table rotation for '+tableName+' is now created by the fix-script. sys_id='+sysId);
}
function getScriptName() {
	return 'Fix_Script:Table Rotation for Analytics Data Points Queue:';
}
