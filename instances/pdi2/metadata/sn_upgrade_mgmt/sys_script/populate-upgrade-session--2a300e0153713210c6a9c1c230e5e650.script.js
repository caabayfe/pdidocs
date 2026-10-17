(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord("sn_um_ta_analysis_result");
	gr.addQuery("test_result", current.test_result.toString());
	gr.addQuery("status", "in_progress");
	gr.setLimit(1);
	gr.orderByDesc("sys_created_on");
	gr.query();
	if(gr.next()) {
		gr.setValue("assist_triage_output", current.getUniqueValue());
		gr.setValue("status", "complete");
		gr.update();
	}
})(current, previous);
