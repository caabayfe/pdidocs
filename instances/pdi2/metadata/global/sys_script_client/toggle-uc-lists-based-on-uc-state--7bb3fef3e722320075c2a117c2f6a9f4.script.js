function onLoad() {
	g_form.hideRelatedList('m2m_announcement_uc_can_view');
	g_form.hideRelatedList('m2m_announcement_uc_cannot_view');

	if (g_scratchpad.use_user_criteria + '' === 'true' && g_form.getValue('public') !== 'true') {
		g_form.showRelatedList('m2m_announcement_uc_can_view');
		g_form.showRelatedList('m2m_announcement_uc_cannot_view');
	}
}
