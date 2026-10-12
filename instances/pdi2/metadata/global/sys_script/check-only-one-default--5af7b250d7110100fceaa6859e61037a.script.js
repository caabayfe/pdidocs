var gr = new GlideRecord("asmt_decision_matrix");
gr.addQuery("metric_type", current.metric_type);
gr.addQuery("isdefault", true);
gr.addQuery("sys_id", "!=", current.sys_id);
gr.query();
if (gr.hasNext()) {
	var errMsg = gs.getMessage('You may only have a single default Decision Matrix for this type');
	gs.addErrorMessage(errMsg);
	current.setAbortAction(true);
}
