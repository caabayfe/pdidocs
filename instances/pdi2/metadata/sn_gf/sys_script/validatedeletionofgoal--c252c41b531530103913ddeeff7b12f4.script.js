(function executeRule(current, previous /*null when async*/) {
	var deleteInfo = (new GFCoreGoal(current.getUniqueValue(),current)).canDelete();
	if(!deleteInfo.canDelete){
		current.setAbortAction(true);
		gs.addErrorMessage(deleteInfo.message);
	}
})(current, previous);
