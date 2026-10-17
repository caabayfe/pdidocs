var newRecord = new KBKnowledge().republish(current);
if(newRecord){
	var validTo = newRecord.getValue("valid_to");
	gs.addInfoMessage(new KBKnowledge().getStateMessage(newRecord.getValue("workflow_state")));
	action.setRedirectURL(newRecord);
}
else
	gs.addErrorMessage(gs.getMessage("You cannot republish this article. Please try again later."));
