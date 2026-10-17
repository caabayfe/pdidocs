function onLoad() {
	g_form.hideRelatedList('sc_category_user_criteria_mtom');
	g_form.hideRelatedList('sc_category_user_criteria_no_mtom');
	g_form.hideRelatedList('sc_category_company_mtom');
	g_form.hideRelatedList('sc_category_company_no_mtom');
	g_form.hideRelatedList('sc_category_dept_mtom');
	g_form.hideRelatedList('sc_category_dept_no_mtom');
	g_form.hideRelatedList('sc_category_group_mtom');
	g_form.hideRelatedList('sc_category_group_no_mtom');
	g_form.hideRelatedList('sc_category_location_mtom');
	g_form.hideRelatedList('sc_category_location_no_mtom');
	g_form.hideRelatedList('sc_category_user_mtom');
	g_form.hideRelatedList('sc_category_user_no_mtom');
	if (g_scratchpad.use_user_criteria == 'true' || g_scratchpad.user_criteria_migration == 'true') {
		g_form.showRelatedList('sc_category_user_criteria_mtom');
		g_form.showRelatedList('sc_category_user_criteria_no_mtom');
	}
	if (g_scratchpad.use_user_criteria == 'false' || g_scratchpad.user_criteria_migration == 'true') {
		g_form.showRelatedList('sc_category_company_mtom');
		g_form.showRelatedList('sc_category_company_no_mtom');
		g_form.showRelatedList('sc_category_dept_mtom');
		g_form.showRelatedList('sc_category_dept_no_mtom');
		g_form.showRelatedList('sc_category_group_mtom');
		g_form.showRelatedList('sc_category_group_no_mtom');
		g_form.showRelatedList('sc_category_location_mtom');
		g_form.showRelatedList('sc_category_location_no_mtom');
		g_form.showRelatedList('sc_category_user_mtom');
		g_form.showRelatedList('sc_category_user_no_mtom');
	}
}
