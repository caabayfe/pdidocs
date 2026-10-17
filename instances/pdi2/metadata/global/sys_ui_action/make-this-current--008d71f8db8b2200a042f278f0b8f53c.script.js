var newRecord = new KBVersioning().makeThisCurrent(current);
if(newRecord){
	gs.addInfoMessage(gs.getMessage("A new version of the article is created for revision."));
	action.setRedirectURL(newRecord);
}
else
	gs.addErrorMessage(gs.getMessage("You cannot make this article as the current article as this has already been checked out for revision. Please modify the checked out article or contact your system administrator for further assistance."));
	
