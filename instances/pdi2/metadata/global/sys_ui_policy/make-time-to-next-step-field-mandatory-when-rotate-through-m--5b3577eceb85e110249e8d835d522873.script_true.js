function onCondition() {
	g_form.setSectionDisplay("escalation_audience", false);
	g_form.setMandatory("time_to_next_step", true);
	g_form.setMandatory("roster_position_rtm", true);
	g_form.setDisplay("roster_position_rtm", true);
}
