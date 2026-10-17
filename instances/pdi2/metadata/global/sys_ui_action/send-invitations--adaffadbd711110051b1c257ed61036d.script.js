sendInvitations(current.sys_id);

function sendInvitations(surveyId){
	var returnIds = new SNC.AssessmentCreation().createAssessments(surveyId);
	var returnValues = returnIds.split(',');
	if (returnValues.length >= 2)
		users = parseInt(returnValues[1]);
	else
		users = 0;
	if (users > 0)
		gs.addInfoMessage(gs.getMessage('Invited {0} users to take the survey.', users+''));
	else
		gs.addInfoMessage(gs.getMessage('No new invitation sent for the survey'));
}
