checkIfUniqueInput();
function checkIfUniqueInput() {
	var gr = new GlideRecord("pa_text_keywords");
	gr.addQuery("widget", current.widget);
	gr.addQuery("indicator", current.indicator);
	gr.addQuery("breakdown", current.breakdown);
	gr.addQuery("element", current.element);
	gr.addQuery("breakdown_level2", current.breakdown_level2);
	gr.addQuery("element_level2", current.element_level2);
	gr.addQuery("field", current.field);
	gr.query();

	if(gr.next() && current.sys_id != gr.getUniqueValue()) {
		gs.addErrorMessage(gs.getMessage('pa_text_keywords.already_exists'));
		current.setAbortAction(true);
		return false;
	}
	return true;
}
