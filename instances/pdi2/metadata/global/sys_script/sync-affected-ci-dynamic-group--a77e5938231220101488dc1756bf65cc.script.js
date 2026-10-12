(function executeRule(current, previous /*null when async*/) {
	var cmdb = current.ci_item.getRefRecord();

	//Return from unpacking as Application Service groups are not unpacked
	if (cmdb.getValue('service_classification') === 'Application Service')
		return;

	if (current.operation() === 'insert') {
		new TaskUtils().createWorker(current, gs.getUserID(), false);
		gs.addInfoMessage(gs.getMessage("Unpacking of {0} has been initiated", [cmdb.getDisplayValue('name')]));
	} else {
		new TaskUtils().createWorker(current, gs.getUserID(), true);
		gs.addInfoMessage(gs.getMessage("Removal of {0} has been initiated", [cmdb.getDisplayValue('name')]));
	}

})(current, previous);
