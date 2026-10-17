function onCondition() {
	var ucEnabled = g_scratchpad.use_user_criteria + '' === 'true';

	g_form.setDisplay('roles', !ucEnabled);
	g_form.setDisplay('show_for_unauthenticated_users_only', false);

	if (ucEnabled) {
		g_form.showRelatedList('m2m_announcement_uc_can_view');
		g_form.showRelatedList('m2m_announcement_uc_cannot_view');
	}
}
