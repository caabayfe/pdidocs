function onCondition() {
	g_form.setSectionDisplay("escalation_audience", true);
	g_form.setMandatory("time_to_next_step", false);
	g_form.setMandatory("roster_position_rtm", false);
	g_form.setDisplay("roster_position_rtm", false);
}
