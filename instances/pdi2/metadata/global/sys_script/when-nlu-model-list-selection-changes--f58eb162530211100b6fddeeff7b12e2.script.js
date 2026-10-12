(function executeRule(current, previous /*null when async*/) {
	var composite = new AutoResolutionComposite(current.getUniqueValue());
	composite.updateSolutionDefinitionsForAllLanguages();
})(current, previous);
