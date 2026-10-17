function onLoad() {

	// Applicable only for old state model, not for new state model
	if (g_scratchpad.isNewStateModel){
		g_form.setSectionDisplay('post_incidentreview', false);
		g_form.setMandatory('resolution_notes', false);
		g_form.setMandatory('resolution_code', false);
		return;
	}

	//Show PIR section only if state is resolved or closed
	var curr_state = g_form.getValue('state');
	if (curr_state == 'resolved' || curr_state == 'closed') {
		g_form.setSectionDisplay('post_incidentreview', true);
		g_form.setMandatory('resolution_notes', true);
		g_form.setMandatory('resolution_code', true);
		if (g_form.getValue('resolution_notes') != ""){
			g_form.setReadOnly('resolution_notes', true);
			g_form.setReadOnly('resolution_code', true);
		}
	} else {
		g_form.setSectionDisplay('post_incidentreview', false);
		g_form.setMandatory('resolution_notes', false);
		g_form.setMandatory('resolution_code', false);
	}

}
