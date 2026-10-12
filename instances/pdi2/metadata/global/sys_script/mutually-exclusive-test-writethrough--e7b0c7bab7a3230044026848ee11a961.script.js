(function executeRule(current, previous /*null when async*/) {

	// Only allow writes for mutual exclusion rules
	if (current.getValue("reason") !== "mutual_exclusion_rule") {
		gs.addErrorMessage(gs.getMessage("Unable to update system-generated mutual exclusions"));
		current.setAbortAction(true);
		return;
	}

	var test = current.getValue("test");
	var exclusive = current.getValue("exclusive_with");
	var gr = new GlideRecord("sys_atf_mutual_exclusion_rule");
	// This query means that "test" and "exclusive" can be either test1 or test2 on the mutual exclusion rule record --
	// i.e. the mutual exclusion rule record is "symmetrical"
	gr.addQueryString("test1=" + test + "^test2=" + exclusive +
						"^NQtest1=" + exclusive + "^test2=" + test, true);
	gr.query();
	if (gr.next()) {
		gr.notes = current.notes;
		gr.update();
	}

})(current, previous);
