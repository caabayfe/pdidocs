validateReferenceTableRule();

function validateReferenceTableRule() {
	var newRule = current.table_archive_rule;
	
	//always allow setting to empty
	if (newRule.nil())
		return;

	//get all rules within this table's parent hierarchy
	var archiveRules = new GlideRecord('sys_archive');
	archiveRules.addQuery('table', GlideDBObjectManager.getTables(current.table));
	archiveRules.query();
	while (archiveRules.next()) {
		//if any sys_id returned matches the new rule, allow the assignment
		if (newRule.equals(archiveRules.getUniqueValue()))
			return;
	}

	//rule not found in list of valid rules returned by query
	gs.addInfoMessage(gs.getMessage("Invalid Reference table rule provided. The rule must be for the related record table, or a parent table in its hierarchy."));
	current.setAbortAction(true);
	current.setValue('table_archive_rule', null);
}
