function onLoad() {
	var mandatoryAttributes = ['direction', 'target_value', 'goal_indicator', 'unit'];
	for(var idx = 0; idx < mandatoryAttributes.length; idx++)
		g_form.setMandatory(mandatoryAttributes[idx], true);

	// When creating new goal and in business application view, hide some of the attributes and achievement section
	if(g_form.isNewRecord()) {
		var hideAttributes = ['active', 'status_indicator', 'short_description','estimated_achievement', 'actual_achievement_till_date', 'comments'];
		for(idx = 0; idx < hideAttributes.length; idx++)
			g_form.setVisible(hideAttributes[idx], false);
		g_form.setSectionDisplay("achievement", false);
	}	
	
}
