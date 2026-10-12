if (current.limit < 1){
	current.limit.setError(gs.getMessage("Limit cannot be negative or zero"));
	current.setAbortAction(true);
}
