(function executeRule(current, previous /*null when async*/) {

	gs.eventQueue('problem.state_change', current,  current.state, previous.state);

})(current, previous);
