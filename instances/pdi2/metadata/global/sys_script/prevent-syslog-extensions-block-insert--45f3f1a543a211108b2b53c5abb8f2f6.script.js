(function executeRule(current, previous /*null when async*/) {

	if (j2js(GlideDBObjectManager.get().getTableExtensions('syslog')).indexOf(current.table.toString()) != -1) {
		gs.addErrorMessage(gs.getMessage("Insert protections for tables that extend 'syslog', such as '{0}', cannot be changed to block.", [current.table]));
		current.setAbortAction(true);
	}

})(current, previous);
