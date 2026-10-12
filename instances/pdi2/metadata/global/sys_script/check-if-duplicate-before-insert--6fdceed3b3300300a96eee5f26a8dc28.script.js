checkIfUniqueUUID();
function checkIfUniqueUUID() {
	var gr = new GlideRecord("pa_text_stop_words");
	gr.addQuery("type", current.type);
	var uuid = "";
	if(current.type == 1){
		gr.addQuery("indicator_source", current.indicator_source);
		current.indicator = "";
		current.breakdown = "";
		current.element = "";
		current.breakdown_level2 = "";
		current.element_level2 = "";
	}
	else {
		gr.addQuery("indicator", current.indicator);
		gr.addQuery("breakdown", current.breakdown);
		gr.addQuery("element", current.element);
		gr.addQuery("breakdown_level2", current.breakdown_level2);
		gr.addQuery("element_level2", current.element_level2);
		current.indicator_source = "";
	}
	gr.query();

	if(gr.next() && current.sys_id != gr.getUniqueValue()) {
		gs.addErrorMessage(gs.getMessage('pa_text_stop_words.already_exists'));
		current.setAbortAction(true);
		return false;
	}
	return true;
}
