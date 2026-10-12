var answer;
if (gs.hasRole("assessment_admin"))
	answer = false;
else if (gs.hasRole("survey_creator")) {
	if ((parent.metric_type.survey_owners+"").indexOf(gs.getUserID()) !== -1) {
		// don't remove edit button
		answer = false;
	} else
		// remove edit button
		answer = true;
} else
	answer = true;
answer;
