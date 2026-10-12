(function executeRule(current, previous /*null when async*/) {
	if (current.category.qb_evaluation_method)
		g_scratchpad.evaluation_method = current.getElement("category.qb_evaluation_method").toString();
	else
		g_scratchpad.evaluation_method = current.getElement("metric_type.evaluation_method").toString();
	
	// Check if source field has available choices
	g_scratchpad.has_source_field_choices = false;
	var sourceFieldChoices = current.getElement("source_field").getChoices();
	if (sourceFieldChoices && sourceFieldChoices.length > 0) 
		g_scratchpad.has_source_field_choices = true;
	
})(current, previous);
