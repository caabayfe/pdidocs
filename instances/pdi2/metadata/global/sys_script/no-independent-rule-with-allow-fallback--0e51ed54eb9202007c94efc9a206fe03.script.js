if (current.identifier.independent) {
	gs.addInfoMessage(gs.getMessage("Allow fallback to parent not allowed for independent rules!"));
	current.setAbortAction(true);
}
