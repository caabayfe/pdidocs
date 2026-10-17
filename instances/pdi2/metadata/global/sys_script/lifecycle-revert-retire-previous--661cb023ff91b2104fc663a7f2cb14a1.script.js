(function executeRule(current, previous /*null when async*/) {


	var previousGr = new GlideRecord(current.getTableName());
	previousGr.get(current.getValue('previous_sttrm_template'));
	if (previousGr.getValue('state') === 'pending_retirement') {
		previousGr.setValue('state', 'published');
		previousGr.update();
	}

})(current, previous);
