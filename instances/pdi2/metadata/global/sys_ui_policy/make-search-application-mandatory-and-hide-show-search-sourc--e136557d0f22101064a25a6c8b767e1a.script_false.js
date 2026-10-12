function onCondition() {
	g_form.setMandatory('search_application', false);
	g_form.showRelatedList('m2m_sp_portal_search_source.sp_portal_list');
	if (!g_form.isNewRecord() && g_tabs2List)
		g_tabs2List.setActive(0);
}
