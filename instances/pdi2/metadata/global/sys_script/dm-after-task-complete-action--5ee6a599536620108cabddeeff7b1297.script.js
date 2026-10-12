(function executeRule(current, previous /*null when async*/ ) {
	var CERTIFICATION_TYPE = 'fe2a16b3436031106d8a8ef0dab8f2ff';

	try {
		var ledgerElement = current.policy_id.ledger_table;
		var ledgerTable = global.JSUtil.nil(ledgerElement) ? '' : ledgerElement + '';
		if (ledgerTable) { 
			gs.eventQueue('sn_cmdb_ws.dm.after_task_complete', current, current.getUniqueValue(), '');
			return;
		}
	} catch (e) {
		gs.error('DM After Task Complete Action BR: ledger branch failed for task ' + current.getUniqueValue() + ': ' + e);
		// fall through: still attempt the synchronous cleanup below (unless Certification)
	}

	if ((current.policy_id.cmdb_policy_type + '') == CERTIFICATION_TYPE)
		return;

	try {
		var helper = new CMDBDataManagerHelper();
		helper.cleanupTaskToCIRecords(current);
	} catch (e) {
		gs.error('DM After Task Complete Action BR: Failed for task ' + current.getUniqueValue() + ': ' + e);
	}
})(current, previous);
