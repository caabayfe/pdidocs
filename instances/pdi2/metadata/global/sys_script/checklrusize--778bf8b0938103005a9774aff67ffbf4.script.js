(function executeRule(current, previous /*null when async*/) {
    if (current.lru_size <= 12) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("LRU size must be greater than 12"));
	}

})(current, previous);
