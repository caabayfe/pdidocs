(function executeRule(current, previous /*null when async*/) {
	var composite = new AutoResolutionComposite(current.configuration);
	composite.createOrUpdateCompositeSolution(current);	
})(current, previous);
