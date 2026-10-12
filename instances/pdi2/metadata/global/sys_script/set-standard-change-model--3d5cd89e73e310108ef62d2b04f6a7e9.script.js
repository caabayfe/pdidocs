(function executeRule(current, previous /*null when async*/) {
	// Standard Change Model
	current.setValue("chg_model", ChangeModelChgReqAPISNC.getModelOrDefault("standard"));
})(current, previous);
