var gr = new GlideRecord("asmt_bubble_chart");
gr.addQuery("metric_type", current.metric_type);
gr.addQuery("isdefault", true);
gr.addQuery("sys_id", "!=", current.sys_id);
gr.query();
if (gr.hasNext()) {
	var errMsg = gs.getMessage('You may only have a single default Bubble Chart for the metric type : {0}', current.getDisplayValue('metric_type'));
	gs.addErrorMessage(errMsg);
	current.setAbortAction(true);
}
