(function executeRule(current, previous /*null when async*/) {

	var recommendedFields = current.recommended.split(",");
    for(var i = 0; i < recommendedFields.length; i++) {
		var field = recommendedFields[i];
		//if field is a dot walked field, don't allow beyond 1-level
		if(field.indexOf('.') != -1 && field.split('.').length > 2) {
			gs.addErrorMessage(gs.getMessage("Only 1 level dot-walked fields are allowed in recommended fields."));
			current.setAbortAction(true);
		}
	}

})(current, previous);
