(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	//date fields validation
	if((!current.recurrence_start.nil()) && (!current.recurrence_end.nil())){
		var now = new GlideDateTime().getNumericValue();
		var start = (new GlideDateTime(current.getValue('recurrence_start'))).getNumericValue();  
		var end = (new GlideDateTime(current.getValue('recurrence_end'))).getNumericValue();  
		
		if (now > start) {
			gs.addErrorMessage(gs.getMessage('Start date must be after current time'));
			current.setAbortAction(true);
		}
		
		if (start >= end) {
			gs.addErrorMessage(gs.getMessage('Start date must be before End date'));
			current.setAbortAction(true);
		}
	}
	
	//custom interval in days field validation
	if(parseInt(current.custom_interval_in_days)<1){
		gs.addErrorMessage(gs.getMessage('Days must be greater than 0'));
		current.setAbortAction(true);
	}

})(current, previous);
