if (current.isNewRecord() || ((current.metric.metric_type+"") != "" && (current.metric.metric_type.survey_owners+"").indexOf(gs.getUserID()) !== -1))
	answer = true;
else 
	answer = false;
