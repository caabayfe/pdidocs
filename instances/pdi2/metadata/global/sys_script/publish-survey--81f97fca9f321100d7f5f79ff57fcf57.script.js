publishTheSurvey();

function publishTheSurvey() {	
	var surveyId = current.sys_id;
	var returnIds = new SNC.AssessmentCreation().createAssessments(surveyId);
	var returnValues = returnIds.split(',');
	var users = 0;
	if (returnValues.length >= 2)
		users = parseInt(returnValues[1]);
	else
		users = 0;

	if (users > 1)
		gs.Log('Published the survey to '+users+' users');
	else
		gs.Log('Published the survey to ZERO users');
}
	
