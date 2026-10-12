(function executeRule(current, previous /*undefined when async or display*/) {

	// Preconditions for running conflict detection satisfied so return
	if (ChangeCheckConflicts.allowConflictDetection(current, previous))
		return;
		
	// Update conflict fields for current change_request record
	current.conflict_status = 'Not Run';
	current.conflict_last_run = "";
	
	var currentChgSysId = current.getUniqueValue();
	var chgSysIds = {};
	var conflictGR = new GlideRecord("conflict");
	conflictGR.addQuery("change", currentChgSysId).addOrCondition("conflicting_change", currentChgSysId);
	conflictGR.query();
	while (conflictGR.next()) {
		var changeSysId = conflictGR.getValue("change");
		if (!gs.nil(changeSysId))
			chgSysIds[changeSysId] = null;
		var conflictChangeSysId = conflictGR.getValue("conflicting_change");
		if (!gs.nil(conflictChangeSysId))
			chgSysIds[conflictChangeSysId] = null;
		conflictGR.deleteRecord();
	}

	delete chgSysIds[currentChgSysId];

	// Update associated change_request conflict information
	for (var chgSysId in chgSysIds) {
		conflictGR = new GlideAggregate("conflict");
		conflictGR.addQuery("change", chgSysId).addOrCondition("conflicting_change", chgSysId);
		conflictGR.addAggregate("COUNT");
		conflictGR.query();
		conflictGR.next();
		if (parseInt(conflictGR.getAggregate("COUNT")) === 0) {
			var chgGR = new GlideRecord("change_request");
			if (chgGR.get(chgSysId)) {
				chgGR.conflict_status = "Not Run";
				chgGR.conflict_last_run = "";
				chgGR.update();
			}
		}
	}

})(current, typeof previous != 'undefined' ?  previous : null);
