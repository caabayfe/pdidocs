(function executeRule(current, previous /*null when async*/) {

	//Delete any kb_assist_scan_result records that point to this knowledge article
	var gr = new GlideRecordSecure("kb_assist_scan_result");
	gr.addQuery("target_record", current.getUniqueValue());
	gr.query();

	//need to use deleteRecord in case author doesn't have knowledge admin/manager roles
	while (gr.next()) {
		gr.deleteRecord();
	}

})(current, previous);
