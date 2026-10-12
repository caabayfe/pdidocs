(function executeRule(current, previous /*null when async*/) {

	// Check for duplicate breakpoints -- technically this is handled by a unique index on atf_breakpoint
	// but the business rule gives a chance to print a nice error message instead of a DB error
	var breakpointGR = new GlideRecord("atf_breakpoint");
	breakpointGR.addQuery("step", current.getValue("step"));
	breakpointGR.addQuery("user", current.getValue("user"));
	breakpointGR.addQuery("sys_id", "!=", current.getUniqueValue());
	breakpointGR.query();

	if (!breakpointGR.hasNext())
		return;

	current.setAbortAction(true);
	gs.addInfoMessage(gs.getMessage("ATF:duplicate_breakpoint"));

})(current, previous);
