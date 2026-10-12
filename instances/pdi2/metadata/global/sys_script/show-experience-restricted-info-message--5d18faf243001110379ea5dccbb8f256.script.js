(function executeRule(current, previous /*null when async*/) {
	gs.addInfoMessage(gs.getMessage('Deselect the {0} field to enable this ribbon as a global ribbon in your legacy workspace', current.experience_restricted.getLabel()));
})(current, previous);
