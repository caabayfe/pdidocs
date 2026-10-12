(function executeRule(current, previous /*null when async*/) {
	
	var table_or_column_value = "table_or_column";
	var record_value = "record";

	if (current.synonym_type == table_or_column_value && current.record != ''){
		gs.addErrorMessage(gs.getMessage("For Synonym Type = Table or Column, Record field must be empty"));
		current.setAbortAction(true);
	}
	if (current.synonym_type == record_value && current.record == ''){
		gs.addErrorMessage(gs.getMessage("For Synonym Type = Record, Record field cannot be empty"));
		current.setAbortAction(true);
	}
	
	if (current.synonym_type == record_value && current.element != ''){
		gs.addErrorMessage(gs.getMessage("For Synonym Type = Record, Column Name field must be empty"));
		current.setAbortAction(true);
	}

})(current, previous);
