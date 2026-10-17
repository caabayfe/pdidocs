//check the contract dates
if ((current.starts.nil()) && (!current.ends.nil())) {
    gs.addErrorMessage(gs.getMessage('Start date must be specified'));
    current.setAbortAction(true);
} else if ((!current.starts.nil()) && (!current.ends.nil())) {
    var starts = current.starts.getGlideObject().getNumericValue();
    var ends = current.ends.getGlideObject().getNumericValue();
    if (starts > ends) {
        gs.addErrorMessage(gs.getMessage('Start date must be before end date'));
        current.setAbortAction(true);
    }
}

//check the renewal/extension dates
if ((current.renewal_date.nil()) && (!current.renewal_end_date.nil())) {
    gs.addErrorMessage(gs.getMessage('Renewal start date must be specified'));
    current.setAbortAction(true);
} else if ((!current.renewal_date.nil()) && (!current.renewal_end_date.nil())) {
	var contractStart = current.starts.getGlideObject().getNumericValue();
    var starts = current.renewal_date.getGlideObject().getNumericValue();
    var ends = current.renewal_end_date.getGlideObject().getNumericValue();
	var rightNow = new GlideDateTime().getNumericValue();
	
    if (starts > ends) {
        gs.addErrorMessage(gs.getMessage('Renewal start date must be before end date'));
        current.setAbortAction(true);
    }
	
	if(ends < rightNow) {
		gs.addErrorMessage(gs.getMessage('Renewal end date must be after current date'));
        current.setAbortAction(true);
	}
	
	if (starts < contractStart) {
	gs.addErrorMessage(gs.getMessage('Renewal start date must be after contract start date'));
	current.setAbortAction(true);
}
}
