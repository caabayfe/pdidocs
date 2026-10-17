answer = hasAccess();

function hasAccess() {
	if (gs.hasRole('upgrade_admin'))
		return true;

	if (hasTrackerAccess(current))
		return true;

	return false;
}

function hasTrackerAccess(gr) {
	if (gr.sys_created_by.equals(gs.getUserName()))
		return true;

	if (gr.sys_created_by.equals(gs.getImpersonatingUserName()))
		return true;

	if (gr.source_table.nil() || gr.source.nil())
		return false;

	var sourceRecord = new GlideRecord(gr.source_table);
	sourceRecord.setWorkflow(false);
	if (!sourceRecord.isValid() || !sourceRecord.get(gr.source))
		return false;

	return sourceRecord.canRead();
}
