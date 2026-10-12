(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var states = current.getValue('visited_state')  || '';
	var state_list = states.split(",");
	var present = false;
	for(i = 0 ; i < state_list.length; i++) {
		if (state_list[i] == current.stage) {
			present = true;
			break;
		}
	}
	if (!present) {
		state_list.push(current.stage);
		current.visited_state = state_list.toString();
	}
})(current, previous);
