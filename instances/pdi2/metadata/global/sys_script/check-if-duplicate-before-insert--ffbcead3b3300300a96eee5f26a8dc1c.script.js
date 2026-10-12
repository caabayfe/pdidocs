checkIfUniqueCube();
function checkIfUniqueCube() {
	var gr = new GlideRecord("pa_text_index_configurations");
	gr.addQuery('sys_domain', current.sys_domain);
	gr.addQuery('cube', current.cube);
	gr.query();

	if(gr.next() && current.sys_id != gr.getUniqueValue()) {
		gs.addErrorMessage(gs.getMessage('pa_text_index_configurations.already_exists', current.cube.getDisplayValue()));
		current.setAbortAction(true);
		return false;
	}
	return true;
}
