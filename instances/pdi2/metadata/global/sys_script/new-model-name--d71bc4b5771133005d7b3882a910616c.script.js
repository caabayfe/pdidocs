(function executeRule(current, previous /*null when async*/ ) {
	
    current.name = NLUParloIntegrator.getModelSolutionName(current.getUniqueValue());
	
})(current, previous);
