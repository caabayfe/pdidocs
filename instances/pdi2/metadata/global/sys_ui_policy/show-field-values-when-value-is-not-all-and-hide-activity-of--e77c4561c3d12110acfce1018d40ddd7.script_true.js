function onCondition() {
	if(g_form.getValue("type") == "DEFAULT") {
		g_form.setValue("activity_of_interest", false);
		g_form.setDisplay("activity_of_interest",false);
		jQuery("#activity_of_interest_annotation").parent().hide();
	}
}
