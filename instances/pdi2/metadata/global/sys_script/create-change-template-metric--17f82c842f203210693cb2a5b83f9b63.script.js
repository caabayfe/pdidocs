(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecordSecure('chg_template_metric');
	gr.addQuery('chg_template', current.getUniqueValue());
	gr.query();
	if (gr.hasNext())
		return;
	gr.initialize();
	gr.setValue('chg_template', current.getUniqueValue());
	gr.insert();

})(current, previous);
