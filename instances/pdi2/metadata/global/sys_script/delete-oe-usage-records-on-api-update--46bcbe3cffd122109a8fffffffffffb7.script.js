(function executeRule(current, previous /*null when async*/) {
	var definitionId = current.getUniqueValue();
	var usageGr = new GlideRecord("sys_one_extend_usage");
	usageGr.addEncodedQuery("definitionLIKE"+ definitionId);
	usageGr.query();

	while (usageGr.next()) {
		usageGr.deleteRecord();
	}

})(current, previous);
