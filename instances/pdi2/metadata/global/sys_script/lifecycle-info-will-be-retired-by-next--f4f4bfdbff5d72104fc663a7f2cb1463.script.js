(function executeRule(current, previous /*null when async*/) {
	
	var copyGR = new GlideRecord(current.getTableName());
	copyGR.addQuery('previous_sttrm_template', current.getUniqueValue());
	copyGR.addQuery('previous_sttrm_template_retire_on_publish', true);
	copyGR.query();

	if (copyGR._next()) {
		gs.addInfoMessage(
			gs.getMessage(
				'This template will be retired when "{0}" is published.',
				copyGR.getDisplayValue()
			)
		);
	}

})(current, previous);
