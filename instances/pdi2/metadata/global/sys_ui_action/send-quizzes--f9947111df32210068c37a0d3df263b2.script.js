sendInvitations(current.sys_id);

function sendInvitations(surveyId){
	var returnIds = new SNC.AssessmentCreation().createAssessments(surveyId);
	var returnValues = returnIds.split(',');
	if (returnValues.length >= 2)
		users = parseInt(returnValues[1]);
	else
		users = 0;
	if (users > 0)
		gs.addInfoMessage(gs.getMessage('Sent the quiz to {0} users', users+''));
	else
		gs.addInfoMessage(gs.getMessage('Unable to send this quiz: ') + returnIds);
}
