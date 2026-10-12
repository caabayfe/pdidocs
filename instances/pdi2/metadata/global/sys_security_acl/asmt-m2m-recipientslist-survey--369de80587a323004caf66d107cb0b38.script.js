var canSurveyCreatorDelete = true;
if (gs.hasRole('survey_creator')) {
	if ((current.metric_type+"") !== "" && (current.metric_type.survey_owners+"").indexOf(gs.getUserID()) !== -1)
		canSurveyCreatorDelete = true;
	else 
		canSurveyCreatorDelete = false;
}
answer = canSurveyCreatorDelete;
