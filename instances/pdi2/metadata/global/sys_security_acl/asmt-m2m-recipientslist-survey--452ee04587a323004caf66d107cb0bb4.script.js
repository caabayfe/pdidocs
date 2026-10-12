var canSurveyCreatorWrite = true;
if (gs.hasRole('survey_creator')) {
	if (current.isNewRecord() || ((current.metric_type+"") !== "" && (current.metric_type.survey_owners+"").indexOf(gs.getUserID())) !== -1)
		canSurveyCreatorWrite = true;
	else 
		canSurveyCreatorWrite = false;
}
answer = canSurveyCreatorWrite;
