(function executeRule(current, previous /*null when async*/) {

	var mlHelper = new AutoResolutionMLHelper(current.getUniqueValue());
	var result = mlHelper.updateSolutions();
	if (result.status == 'error') 
		gs.addErrorMessage(result.msg);
	else
		gs.addInfoMessage(gs.getMessage('Machine learning model solution is updated. Please train or re-train the model to use updated solution'));

})(current, previous);
