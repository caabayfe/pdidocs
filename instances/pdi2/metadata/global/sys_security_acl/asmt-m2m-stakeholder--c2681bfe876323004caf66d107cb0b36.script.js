if (current.isNewRecord() || ((current.assessment_record.metric_type+"") !== "" && (current.assessment_record.metric_type.survey_owners+"").indexOf(gs.getUserID()) !== -1))
	answer = true;
else 
	answer = false;
