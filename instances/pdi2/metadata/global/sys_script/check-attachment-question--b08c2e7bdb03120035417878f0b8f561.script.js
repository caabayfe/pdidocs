(function executeRule(current, previous) {

	if( current.datatype.toString() == 'attachment' && new SurveyCoreUtils().surveyIsPublic(current.category.metric_type.toString())){
		gs.addErrorMessage(gs.getMessage("Cannot add attachment question to a public survey"));
		current.setAbortAction(true);
	}

})(current, previous);
