(function executeRule(current, previous /*null when async*/) {
	
	var invalidQueryTerms = ["job_classification", "MATCH_RGX"];
	var invalidQueryDisplayValues = ["Job classification", "matches regex"];
	var queryString = current.getValue("condition");

	if (GlideStringUtil.nil(queryString)) {
		gs.addErrorMessage(gs.getMessage("Condition field cannot be empty"));
		current.setAbortAction(true);
	}
	if (GlideStringUtil.nil(current.getValue("classification_name"))) {
		gs.addErrorMessage(gs.getMessage("Classification name cannot be empty"));
		current.setAbortAction(true);
	}

	for (var i = 0; i < invalidQueryTerms.length; i++) {
		if (queryString.includes(invalidQueryTerms[i])){
			gs.addErrorMessage(gs.getMessage("Condition field cannot contain {0}",  invalidQueryDisplayValues[i]));
			current.setAbortAction(true);
		}
	} 
})(current, previous);
