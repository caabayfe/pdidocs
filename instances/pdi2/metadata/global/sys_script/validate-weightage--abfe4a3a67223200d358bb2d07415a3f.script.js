(function executeRule(current, previous /*null when async*/) {
	
	gs.flushMessages();
	var isAqiPending = new KBAQI().isAqiPendingInKb(current.sys_id,previous.checklist);
	if(isAqiPending){
		gs.addErrorMessage(gs.getMessage('AQI reviews using this checklist are in progress. You cannot modify this AQI checklist until all reviews are complete.'));
		current.setAbortAction(true);
		return;
	}
	
	if(current.checklist  == '')
		return;
	
	var totalAllowedWeight = parseInt(100);
	
	var totalWeight = new KBAQI().getTotalWeight(current.checklist);
	if(totalWeight != totalAllowedWeight){
		gs.addErrorMessage(gs.getMessage("Either this AQI checklist doesn't have any questions defined or the total weight of all questions for this checklist is not equal to 100."));
		current.setAbortAction(true);
		return;
	}
	gs.addInfoMessage(gs.getMessage('AQI checklist was successfully added to the knowledge base.'));
		

})(current, previous);
