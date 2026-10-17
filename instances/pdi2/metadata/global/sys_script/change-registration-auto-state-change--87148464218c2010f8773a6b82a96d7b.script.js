(function executeRule(current, previous /*null when async*/) {
	var changeModel = new ChangeModel(current.chg_model.getRefRecord());
	changeModel.applyAutomaticTransition(current);
})(current, previous);
