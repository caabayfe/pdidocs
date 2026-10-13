(function executeRule(current, previous /*null when async*/) {
	var solDef = current.getValue('ml_solution_def_config');
	if(gs.nil(solDef) || Object.keys(JSON.parse(solDef)).length === 0) {
		var details = new PiwbMLHelper().getSolutionDefinitionDetails(current.getValue('ml_solution_definition'));
		current.ml_solution_def_config = details;
		if(JSON.parse(details).capability == 'classification_trainer') {
			current.sa_plan = PIWBConstants.CLASSIFICATION_PLAN.ID;
		}
	}
})(current, previous);
