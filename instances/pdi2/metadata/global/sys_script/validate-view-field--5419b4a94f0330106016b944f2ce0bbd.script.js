(function executeRule(current, previous /*null when async*/) {
	// Add your code here
	if (!current.view) return;
	
	var available_views = getAvailableViewsForForm(current.table);
	
	if(available_views == null || available_views.indexOf(current.view.toString()) < 0) {
		var error = gs.getMessage("View should be one of [{0}], otherwise select the table or check the Global box", [available_views.toString()]);
		current.view.setError(error);
		current.setAbortAction(true);
	}

})(current, previous);
