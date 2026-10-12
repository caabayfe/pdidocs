(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord("sys_atf_test_result");
	gr.addQuery("test", current.sys_id);
	gr.addQuery("status", "IN", GlideStringUtil.join(["pending", "running", "waiting", "paused"]));
	gr.setLimit(1);
	gr.query();
	if (gr.next()) {
		var testResultId = gr.sys_id;
		current.setAbortAction(true);
		var message = gs.getMessage("ATF_TG:tried_to_delete_test", testResultId);
		gs.addErrorMessage(message);
	}
	// Add your code here

})(current, previous);
