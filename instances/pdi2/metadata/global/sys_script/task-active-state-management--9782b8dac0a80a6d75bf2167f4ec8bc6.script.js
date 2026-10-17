/**
 Service-now.com

 Description: Generic task closer/opener using table level state definitions
 **/

processTaskStates();

function processTaskStates() {

	//use TaskStateUtil logic
	var stateUtil = new TaskStateUtil(current);
	var closeStates = stateUtil.getInactiveStates();
	//see if we have at least the close state attribute
	if (closeStates == null)
		return;

	//get default close and work state attribute or use defaults
	var defaultCloseState = stateUtil.getDefaultCloseState();
	var defaultWorkState =  stateUtil.getDefaultWorkState();

	//determine previous and current state active status
	var previousStateInactive = stateUtil.isStateInactive(previous.state);
	var currentStateInactive = stateUtil.isStateInactive(current.state);

	//set record to inactive (close) if we move from an active state to an inactive state
	if (!previousStateInactive && currentStateInactive && current.active) {
		current.active = false;
		gs.print(current.getDisplayValue() + ": State changed (" + previous.state.getDisplayValue() + "->" + current.state.getDisplayValue() + "), setting task to inactive");
	}

	//set record to active (reopen) if we move from an inactive state to an active state
	if (previousStateInactive && !currentStateInactive && !current.active) {
		current.active = true;
		gs.print(current.getDisplayValue() + ": State changed (" + previous.state.getDisplayValue() + "->" + current.state.getDisplayValue() + "), setting task to active");
	}

}
