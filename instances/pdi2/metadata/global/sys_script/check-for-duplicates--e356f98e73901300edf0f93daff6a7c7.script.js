(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord("pa_text_phrases");
	gr.addQuery("indicator", current.indicator);
	gr.addQuery("breakdown", current.breakdown);
	gr.addQuery("element", current.element);
	gr.addQuery("breakdown_level2", current.breakdown_level2);
	gr.addQuery("element_level2", current.element_level2);
	gr.query();

	if (gr.next() && current.sys_id != gr.getUniqueValue()) {
		gs.addErrorMessage(gs.getMessage('Phrases for given combination already exist'));
		current.setAbortAction(true);
		return false;
	}
	return true;

})(current, previous);
