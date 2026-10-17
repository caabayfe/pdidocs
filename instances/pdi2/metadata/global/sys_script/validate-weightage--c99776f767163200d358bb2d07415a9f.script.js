(function executeRule(current, previous /*null when async*/) {
	
	gs.flushMessages();
	if(current.weight && parseInt(current.weight) < 0){
		gs.addErrorMessage(gs.getMessage('The weight of a question cannot be a negative value. You must enter a value higher than zero.'));
		current.setAbortAction(true);
		return;
	}
	
	var isAqiPending = new KBAQI().isAqiPendingInChecklist(current.checklist);
	if(isAqiPending){
		gs.addErrorMessage(gs.getMessage("AQI reviews are in progress using this checklist. You cannot add or edit questions for this checklist until all reviews are complete."));
		current.setAbortAction(true);
		return;
	}
	
	if(new KBAQI().isChecklistAttached(current.checklist)){
		gs.addErrorMessage(gs.getMessage("To add a new question or to edit the existing questions in this checklist you must detach the checklist from the knowledge base."));
		current.setAbortAction(true);
		return;
	}
	
	var totalAllowedWeight = parseInt(100);
	var getTotalWeight = new KBAQI().getTotalWeight(current.checklist,current.sys_id);
	
	
	var remainingWeight = parseInt(totalAllowedWeight - getTotalWeight);
	
	if((current.weight) && (parseInt(current.weight) > remainingWeight)){
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("The overall weight of all the questions in this checklist must not exceed 100. Therefore, the maximum possible weight you can apply to this question is {0}",remainingWeight+''));
		return;
	}
	
	
})(current, previous);
