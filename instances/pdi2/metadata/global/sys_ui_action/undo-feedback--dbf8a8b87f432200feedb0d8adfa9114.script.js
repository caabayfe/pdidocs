(function executeUIAction(current) {
	current.undo_edits = !current.undo_edits;
	current.update();
	if (action.get('isFormPage') == 'true') 
		action.setRedirectURL(current);
}(current));
