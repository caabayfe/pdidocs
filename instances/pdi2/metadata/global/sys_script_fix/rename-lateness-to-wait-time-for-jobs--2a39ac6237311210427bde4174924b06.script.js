if (!pm.isZboot()) {
	// pending scheduled jobs table changes
	var PENDING_SCHEDULED_JOB = 'v_pending_scheduled_job';
	var AVG_LATENESS = 'avg_lateness';
	var avgWaitTime = 'Average Wait Time (ms)';
	var avgHourWaitTimeHint = "Classification's Average Wait Time in Past Hour in ms";

	updateColumnLabel(PENDING_SCHEDULED_JOB, AVG_LATENESS, avgWaitTime);
	updateHintAndPlural(PENDING_SCHEDULED_JOB, AVG_LATENESS, avgHourWaitTimeHint, avgWaitTime);

	// scheduled job history table and scheduled job history by node table changes
	var SCHEDULED_JOB_HISTORY = 'sys_scheduler_job_history';
	var TOTAL_LATENESS = 'total_lateness';
	var totalWaitTime = 'Total Wait Time (ms)';
	var totalWaitTimeHint = "Classification's Total Wait Time in ms";
	var avgWaitTimeHint = "Classification's Average Wait Time in ms";
	var MAX_LATENESS = 'max_lateness';
	var maxWaitTime = 'Max Wait Time (ms)';
	var maxWaitTimeHint = "Classification's Maximum Wait Time in ms";

	updateColumnLabel(SCHEDULED_JOB_HISTORY, TOTAL_LATENESS, totalWaitTime);
	updateHintAndPlural(SCHEDULED_JOB_HISTORY, TOTAL_LATENESS, totalWaitTimeHint, totalWaitTime);

	updateColumnLabel(SCHEDULED_JOB_HISTORY, AVG_LATENESS, avgWaitTime);
	updateHintAndPlural(SCHEDULED_JOB_HISTORY, AVG_LATENESS, avgWaitTimeHint, avgWaitTime);

	updateColumnLabel(SCHEDULED_JOB_HISTORY, MAX_LATENESS, maxWaitTime);
	updateHintAndPlural(SCHEDULED_JOB_HISTORY, MAX_LATENESS, maxWaitTimeHint, maxWaitTime);
}

function updateColumnLabel(tableName, fieldName, newLabel) {
	var dictGr = new GlideRecord('sys_dictionary');
	var qc = dictGr.addQuery('name', tableName);
	qc.addOrCondition('name', 'STARTSWITH', tableName);
	dictGr.addQuery('element', fieldName);
	dictGr.addQuery('column_label', '!=', newLabel);
	dictGr.query();
	while (dictGr.next()) {
		dictGr.column_label = newLabel;
		dictGr.update();
		gs.log('Updated column label of ' + fieldName + ' on ' + tableName, 'RenameLatenessToWaitTime');
	}
}

function updateHintAndPlural(tableName, fieldName, newHint, newPlural) {
	var docGr = new GlideRecord('sys_documentation');
	var qc = docGr.addQuery('name', tableName);
	qc.addOrCondition('name', 'STARTSWITH', tableName);
	docGr.addQuery("language", "en");
	docGr.addQuery('element', fieldName);
	docGr.addNullQuery('hint').addOrCondition('hint', '!=', newHint);
	docGr.query();
	while (docGr.next()) {
		docGr.hint = newHint;
		docGr.plural = newPlural;
		docGr.update();
		gs.log('Updated hint and plural of ' + fieldName + ' on ' + tableName, 'RenameLatenessToWaitTime');
	}
}
