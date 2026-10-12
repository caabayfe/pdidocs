function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (newValue == "3" || newValue == "5")
		g_form.showRelatedList("question_choice");
	else
		g_form.hideRelatedList("question_choice");
	
}
