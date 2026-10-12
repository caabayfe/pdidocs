(function executeRule(current, previous /*null when async*/) {
	if (!GlideTableDescriptor.get(current.tablename).isColumnarTable())
		return;

	// Only block the table field actually being set/changed to a columnar table. Once a
	// record already targets one, further saves (e.g. the execution-time skip cancelling it)
	// must still be able to go through.
	if (previous && current.tablename == previous.tablename)
		return;

	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage("Table Cleaner rules cannot be created for table [{0}] because it is a columnar table", current.tablename + ""));
})(current, previous);
