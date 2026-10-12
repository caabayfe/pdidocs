function onLoad() {
	if (!g_form.isNewRecord())
		return;
	if (g_scratchpad.experience_type)
		g_form.setValue('type', g_scratchpad.experience_type);
	if (g_scratchpad.playbook_experience)
		g_form.setValue('playbook_experience', g_scratchpad.playbook_experience);
}
