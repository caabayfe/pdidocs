if (current.isNewRecord() || ((current.assessment+"") != "" && (current.assessment.survey_owners+"").indexOf(gs.getUserID()) !== -1))
	answer = true;
else 
	answer = false;
