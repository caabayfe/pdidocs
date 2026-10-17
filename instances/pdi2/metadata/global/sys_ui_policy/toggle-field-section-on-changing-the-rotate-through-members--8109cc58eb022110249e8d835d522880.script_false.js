function onCondition() {
	g_form.setSectionDisplay("escalation_audience", true);
	g_form.setMandatory("time_to_next_step", false);
	g_form.setMandatory("cmn_rota_roster_rtm", false);
	g_form.setDisplay("cmn_rota_roster_rtm", false);
}
