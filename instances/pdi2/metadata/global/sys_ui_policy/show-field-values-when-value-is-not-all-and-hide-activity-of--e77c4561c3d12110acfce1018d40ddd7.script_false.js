function onCondition() {
	if(g_form.getValue("type") == "DEFAULT") {
		g_form.setDisplay("activity_of_interest", true);
		jQuery("#activity_of_interest_annotation").parent().show();
	}
}
