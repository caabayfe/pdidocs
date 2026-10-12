(function executeRule(current, previous) {	
	if(current.getValue('workflow_state') == 'published') {
		current.setValue('replacement_article', '');
	}
})(current, previous);
