if (current.isNewRecord() || ((current.metric_category.metric_type+"") != "" && (current.metric_category.metric_type.survey_owners+"").indexOf(gs.getUserID()) !== -1))
	answer = true;
else 
	answer = false;
