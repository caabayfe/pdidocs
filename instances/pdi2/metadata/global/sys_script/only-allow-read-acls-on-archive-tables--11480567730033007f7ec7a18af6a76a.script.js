(function executeRule(current, previous /*null when async*/) {
	var name = ''+current.name;
	var end = name.indexOf('.');
	if (end > 0)
		name.slice(0, end);

	if (GlideArchiveTable.isArchive(name)) {
		gs.addErrorMessage(gs.getMessage('Only read ACLs are allowed on archive tables'));
		current.setAbortAction(true);
	}

})(current, previous);
