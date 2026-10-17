(function executeRule(current, previous /*null when async*/) {

	var test1 = current.getValue("test1");
	var test2 = current.getValue("test2");

	// Escape input test names to prevent HTML injection on UI messages
	current.test1.name = GlideStringUtil.escapeHTML(current.test1.name);
	current.test2.name = GlideStringUtil.escapeHTML(current.test2.name);

	// Neither field should ever be completely empty
	if (GlideStringUtil.nil(test1) || GlideStringUtil.nil(test2)) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Mutual exclusion rules require two valid tests to be specified"));
		return;
	}

	// Users cannot make tests exclusive with themselves (ATF already does that for them)
	if (test1 === test2) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Test '{0}' cannot be made mutually exclusive with itself (all tests exclude themselves automatically)", [current.test1.name]));
		return;
	}

	// Check if a mutual exclusion rule for the specified tests already exists (do not include the current record in case this is an update since it would obviously exist in that case)
	// Note that the ordering for the "test1" and "test2" fields does not matter and so both possibilities must be considered in the query
	// (e.g. test1="1234" and test2="5678" is considered a duplicate of test1="5678" and test2="1234")
	var gr = new GlideRecord("sys_atf_mutual_exclusion_rule");
	gr.addQuery("sys_id", "!=", current.getUniqueValue());
	gr.addEncodedQuery("test1=" + test1 + "^test2=" + test2 +
						"^NQtest1=" + test2 + "^test2=" + test1);
	gr.query();
	if (gr.getRowCount() > 0) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Tests '{0}' and '{1}' are already mutually exclusive", [current.test1.name, current.test2.name]));
		return;
	}

})(current, previous);
