
      (function executeRule(current, previous /*null when async*/) {
	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage("Custom functions cannot be added in Global scope."));
})(current, previous);
