var MESSAGE_TABLE = 'automation_error_msg';
var INSTANCE_MESSAGE_TABLE = 'automation_error_instance_msg';

function getOldestInstanceMessage() {
	var oldestInstance = new GlideDateTime();
	var gr = new GlideRecord(INSTANCE_MESSAGE_TABLE);
	gr.orderBy('sys_created_on');
	gr.setLimit(1);
	gr.query();
	if (gr.next())
		oldestInstance = gr.getValue('sys_created_on');
	return oldestInstance;
}

function deleteOlderUnreferencedMessages(oldestToCheck) {
	// Delete any discovery errors that are no longer referenced from the instance table
	// But only look at error messages that are older than the oldest instance record.  Messages
	// will eventually be cleaned up if they are no longer referenced since table cleaner deletes
	// the status and scheduled job deletes the instances that are for deleted statuses.
	var grMsg = new GlideAggregate(MESSAGE_TABLE);
	grMsg.addQuery('application', 'd5069fe9e70332001a310a6103f6a94b'); // discovery app only
	grMsg.addQuery('sys_created_on', '<', oldestToCheck);
	grMsg.query();
	var grInstance = new GlideAggregate(INSTANCE_MESSAGE_TABLE);
	var errorMsgs = [];
	while (grMsg.next()) {
		// if not referenced then add it to the list
		grInstance.initialize();
		grInstance.addQuery('err_msg', grMsg.getValue('sys_id'));
		grInstance.setLimit(1);
		grInstance.query();
		if (grInstance.hasNext())
			continue;

		errorMsgs.push('' + grMsg.getValue('sys_id'));
	}
	var count = errorMsgs.length;
	while (errorMsgs.length) {
		var chunk = errorMsgs.splice(0, 500);
		var gr = new GlideRecord(MESSAGE_TABLE);
		gr.addQuery('sys_id', 'IN', chunk);
		gr.deleteMultiple();
	}
	return count;
}

function cleanUnreferencedErrors() {
	var startTime = new Date().getTime();

	var oldestInstanceRecord = getOldestInstanceMessage();
	gs.debug('Oldest instance error record = ' + oldestInstanceRecord);
	var count = deleteOlderUnreferencedMessages(oldestInstanceRecord);

	var endTime = new Date().getTime();
	var totalTime = endTime - startTime;

	gs.debug('Time to delete ' + count + ' unreferenced error messages = ' + totalTime + ' ms');
}

cleanUnreferencedErrors();
