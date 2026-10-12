(function executeRule(current, previous /*null when async*/) {
	if (!GlideTableDescriptor.get(current.table).isColumnarTable())
		return;

	// Only block the table field actually being set/changed to a columnar table. Once a
	// record already targets one, further saves (e.g. the execution-time skip cancelling it)
	// must still be able to go through.
	if (previous && current.table == previous.table)
		return;

	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage("Data Management jobs cannot be scheduled against table [{0}] because it is a columnar table", current.table + ""));
})(current, previous);
