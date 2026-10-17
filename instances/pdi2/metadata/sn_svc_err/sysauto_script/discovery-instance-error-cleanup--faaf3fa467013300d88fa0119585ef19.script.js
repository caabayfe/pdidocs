// Cleanup errors that are associated to discovery_status and/or discovery_schedules
// that no longer exist
var MESSAGE_INSTANCE_TABLE = 'automation_error_instance_msg';
var CATEGORY_STATS_TABLE = 'automation_error_instance_category_stats';
var CODE_STATS_TABLE = 'automation_error_instance_code_stats';
var DISCOVERY_STATUS_TABLE = 'discovery_status';

function getOldestStatus() {
	var oldestStatus = new GlideDateTime();
	var gr = new GlideRecord(DISCOVERY_STATUS_TABLE);
	gr.orderBy('sys_created_on');
	gr.setLimit(1);
	gr.query();
	if (gr.next())
		oldestStatus = gr.getValue('sys_created_on');
	return oldestStatus;
}

function cleanOldInstanceRecords() {
	var oldestStatus = getOldestStatus();
	gs.debug('deleting error instance records older than ' + oldestStatus);

	var msgInstance = new GlideRecord(MESSAGE_INSTANCE_TABLE);
	msgInstance.addQuery('sys_created_on', '<', oldestStatus);
	msgInstance.deleteMultiple();

	var codeInstance = new GlideRecord(CODE_STATS_TABLE);
	codeInstance.addQuery('sys_created_on', '<', oldestStatus);
	codeInstance.deleteMultiple();

	var categoryInstance = new GlideRecord(CATEGORY_STATS_TABLE);
	categoryInstance.addQuery('sys_created_on', '<', oldestStatus);
	categoryInstance.deleteMultiple();
}

function cleanIt() {
	var startTime = new Date().getTime();

	// delete instances where discovery_status no longer exists
	cleanOldInstanceRecords();
	
	var endTime = new Date().getTime();
	var totalTime = endTime - startTime;
	gs.debug('totalTime = ' + totalTime + ' ms');
}

cleanIt();
