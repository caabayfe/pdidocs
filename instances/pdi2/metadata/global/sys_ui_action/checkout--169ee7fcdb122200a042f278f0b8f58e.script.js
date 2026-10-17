// TODO Move the messages to messages table
var previous_valid_to = current.getDisplayValue("valid_to");
var newRecord = new KBVersioning().checkout(current);
if(newRecord){
	gs.addInfoMessage(gs.getMessage("A new version of the article is created for revision."));
	
	var current_valid_to = newRecord.getDisplayValue("valid_to");
	if(previous_valid_to != current_valid_to){
		if(gs.nil(previous_valid_to))
			gs.addInfoMessage(gs.getMessage("Valid to has been changed to {0}.",current_valid_to));
		else
			gs.addInfoMessage(gs.getMessage("Valid to has been changed from {0} to {1}.",[previous_valid_to ,current_valid_to]));
	}
	
	action.setRedirectURL(newRecord);
}
else
	gs.addErrorMessage(gs.getMessage("You cannot checkout this article as it is already checked out."));
	
