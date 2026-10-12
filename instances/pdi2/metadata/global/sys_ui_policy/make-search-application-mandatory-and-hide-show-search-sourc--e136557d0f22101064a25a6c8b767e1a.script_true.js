function onCondition() {
	if (!g_scratchpad.isAisEnabled) return;
	g_form.setMandatory('search_application', true);
	g_form.hideRelatedList('m2m_sp_portal_search_source.sp_portal_list');

}
