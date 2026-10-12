var versioning = new KBVersioning();
if(versioning.canRecall(current)){
	versioning.recall(current);
	gs.addInfoMessage(gs.getMessage("Moved the article back to draft state"));
	action.setRedirectURL(current);
}
