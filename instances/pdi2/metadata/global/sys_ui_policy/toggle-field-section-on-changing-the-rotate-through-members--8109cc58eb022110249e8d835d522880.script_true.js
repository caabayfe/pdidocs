function onCondition() {
	g_form.setSectionDisplay("escalation_audience", false);
	g_form.setMandatory("time_to_next_step", true);
	g_form.setMandatory("cmn_rota_roster_rtm", true);
	g_form.setDisplay("cmn_rota_roster_rtm", true);
}
