(function executeRule(current, previous /*null when async*/) {

	var record_value = "record";
	if (current.synonym_type == record_value && current.extend_to_all_child_tables == true){
		gs.addErrorMessage(gs.getMessage("For Synonym Type = Record, Extend to all child tables is not supported"));
		current.setAbortAction(true);
	}
	
	
	if (current.synonym_type == "table_or_column" && current.extend_to_all_child_tables == true && current.getValue("element") == null) {
    gs.addErrorMessage(gs.getMessage("For Synonym Type = Table, Extend to all child tables is not supported"));
    current.setAbortAction(true);
}
	
})(current, previous);
