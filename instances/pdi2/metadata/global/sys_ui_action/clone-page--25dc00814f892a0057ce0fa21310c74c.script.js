(function(){
	
	var pageID = current.getValue('id');
	var newPage = new SPClonePage().run(current);

	if(newPage != null){
		gs.addInfoMessage(gs.getMessage("Successfully cloned page from: {0}", pageID));
		action.setRedirectURL(newPage);
	} else {
		gs.addErrorMessage(gs.getMessage("Error cloning page: {0}", pageID));
		action.setRedirectURL(current);
	}
	
})();
