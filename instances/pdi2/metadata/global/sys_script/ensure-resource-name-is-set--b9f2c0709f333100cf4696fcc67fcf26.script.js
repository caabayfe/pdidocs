function onBefore(current, previous) {
	if (current.name.nil()) {
		current.setAbortAction(true);
		gs.addErrorMessage("Resource name is required.");
	}
}
