var prev = previous.state;
var curr = current.state;

// check if this state change is valid
if (!isValidChange(prev,curr)) {
	gs.addErrorMessage(gs.getMessage("<b> {0} </b> to <b> {1} </b> is not a valid transition", [previous.getDisplayValue('state'), current.getDisplayValue('state')]));

	// change the value back to it's old state
	 current.state = previous.state;

	current.setAbortAction("true");
}

// update the logic in the 'PIR Visibility on State Change' client script as well
function isValidChange(from, to){
	var ia_transitions;

	if (gs.getProperty("com.snc.iam.new_state_flow", "false") == "true") {
		ia_transitions = {
			'':					['open'],
			'open': 			['closed','cancelled']
		};
	}
	else {
		ia_transitions = {
			'':					['new'],
			'new': 				['work_in_progress','resolved','cancelled'],
			'work_in_progress':	['resolved','cancelled'],
			'resolved':			['closed']
		};
	}


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
