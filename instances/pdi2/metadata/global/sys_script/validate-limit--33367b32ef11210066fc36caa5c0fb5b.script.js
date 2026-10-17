if (current.limit < 1){
	current.limit.setError(gs.getMessage("Limit cannot be less than one"));
	current.setAbortAction(true);
}
