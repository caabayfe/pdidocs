// global variable containing the initiate state
var initialState = null;

// when the state changes
function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '')
		return;

	// Applicable only for old state model, not for new state model
	if (g_scratchpad.isNewStateModel){
		g_form.setSectionDisplay('post_incidentreview', false);
		g_form.setMandatory('resolution_notes', false);
		g_form.setMandatory('resolution_code', false);
		return;
	}

	// store the initial state
	 if (!initialState) initialState = oldValue;

	// when the initialState changes for closed
	if (newValue == 'closed') {
		// check if it is a valid transition
		if (isValidChange(initialState, newValue)) {
			// then show the PIR form and mark it as being mandatory
			g_form.setSectionDisplay('post_incidentreview', true);
			g_form.setMandatory('resolution_notes', true);
			g_form.setMandatory('resolution_code', true);
			if (g_form.getValue('resolution_notes') != "") {
				g_form.setReadOnly('resolution_notes', true);
				g_form.setReadOnly('resolution_code', true);
			}
		} else {
			// hide the PIR form elements and mark them as being optional
			g_form.setSectionDisplay('post_incidentreview', false);
			g_form.setMandatory('resolution_notes', false);
			g_form.setMandatory('resolution_code', false);
		}
	} else if (!isValidChange(initialState, newValue)) {
			// hide the PIR form elements and mark them as being optional
			g_form.setSectionDisplay('post_incidentreview', false);
			g_form.setMandatory('resolution_notes', false);
			g_form.setMandatory('resolution_code', false);
	}
}

// also see the 'IA State Management' Business Rule
function isValidChange(from, to){
	var ia_transitions = {
		'':					['new'],
		'new': 				['work_in_progress','resolved','cancelled'],
		'work_in_progress':	['resolved','cancelled'],
		'resolved':			['closed']
	};

	var valid_transitions = ia_transitions[from];

	if (valid_transitions === undefined)
         return false;
	else{
		for (var i=0; i<valid_transitions.length; i++)
			if (valid_transitions[i] == to)
				return true;
		return false;
	}
}
