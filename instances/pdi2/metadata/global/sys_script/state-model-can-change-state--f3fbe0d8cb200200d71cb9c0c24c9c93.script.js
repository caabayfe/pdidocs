function onBefore(current, previous) {
    var stateHandler = new ChangeRequestStateHandler(current);
	
	// Check if the change in state that has already occured is valid
    if (!stateHandler.moveFrom(stateHandler.getStateName(previous.state)))
        current.setAbortAction(true);
	
}
