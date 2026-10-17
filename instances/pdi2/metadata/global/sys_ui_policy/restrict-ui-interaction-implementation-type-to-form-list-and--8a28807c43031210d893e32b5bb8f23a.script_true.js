function onCondition() {
	if (!g_form.getOption("declarative_action_type", "interaction")) {
		g_form.addOption("declarative_action_type", "interaction", "UI interaction");
	}
}
