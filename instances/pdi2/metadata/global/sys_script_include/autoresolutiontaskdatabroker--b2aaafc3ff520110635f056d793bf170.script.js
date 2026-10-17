
      var AutoResolutionTaskDataBroker = Class.create();

/**
 * NOTE: This is used to fetch GlideRecord from Flows, Subflows and Actions. The reason being, if we try to access a
 *       record from a different scope than the caller scope, we are restricted. With this, an RCA record will be
 *       created.
 * @param {string} taskTableName
 * @param {string} taskSysID
 * @return {GlideRecord} if valid record exists in the database. Null otherwise
 */
AutoResolutionTaskDataBroker.getTaskRecord = function(taskTableName, taskSysID) {
	var taskGr = new GlideRecordSecure(taskTableName);

	return taskGr.get(taskSysID) ? taskGr : null;
};

/**
 * Set all the required values in taskGr and pass it into this method
 * @param {GlideRecord} taskGr
 * @return {string} if it is a valid update. Null otherwise
 */
AutoResolutionTaskDataBroker.updateTaskRecord = function(taskGr) {
	if (gs.nil(taskGr))
		return;

	if (taskGr.canWrite()) {
		return taskGr.update();
	} else {
		var debugMessage = '[AutoResolutionTaskDataBroker] No permission to update the task record with sys_id: ' + taskGr.getValue('sys_id')
							+ ' for user: ' + gs.getUserName();
		gs.debug(debugMessage);

		return null;
	}
};

/**
 * This method is used to fetch taskGr, since only one RCA will be created for Read operation
 * @param {GlideRecord} contextGr
 * @return {GlideRecord}
 */
AutoResolutionTaskDataBroker.getTaskRecordFromContextRecord = function(contextGr) {
	if (gs.nil(contextGr))
		return;

	// We need to make sure we need to return GlideRecordSecure
	var tableName = contextGr.getElement('configuration').getRefRecord().getValue('target_table_name');
	var sysID = contextGr.getValue('task');

	return AutoResolutionTaskDataBroker.getTaskRecord(tableName, sysID);
};
