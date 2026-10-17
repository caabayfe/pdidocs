function onCondition() {
	g_form.setDisplay('roles', false);
	g_form.setDisplay('show_for_unauthenticated_users_only', true);
	g_form.hideRelatedList('m2m_announcement_uc_can_view');
	g_form.hideRelatedList('m2m_announcement_uc_cannot_view');
}
