if (current.isNewRecord() || ((current.category.qb_evaluation_method+"") == "" && ((current.metric_type+"") != "" && (current.metric_type.survey_owners+"").indexOf(gs.getUserID()) !== -1)))
	answer = true;
else 
	answer = false;
