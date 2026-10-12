function onLoad() {
	if (g_scratchpad.use_user_criteria == 'true' || g_scratchpad.user_criteria_migration == 'true') {
		g_form.showRelatedList('sc_cat_item_user_criteria_mtom');
		g_form.showRelatedList('sc_cat_item_user_criteria_no_mtom');
	} else {
		g_form.hideRelatedList('sc_cat_item_user_criteria_mtom');
		g_form.hideRelatedList('sc_cat_item_user_criteria_no_mtom');
	}
	if (g_scratchpad.use_user_criteria != 'true' || g_scratchpad.user_criteria_migration == 'true') {
		g_form.showRelatedList('sc_cat_item_company_mtom');
		g_form.showRelatedList('sc_cat_item_company_no_mtom');
		g_form.showRelatedList('sc_cat_item_dept_mtom');
		g_form.showRelatedList('sc_cat_item_dept_no_mtom');
		g_form.showRelatedList('sc_cat_item_group_mtom');
		g_form.showRelatedList('sc_cat_item_group_no_mtom');
		g_form.showRelatedList('sc_cat_item_location_mtom');
		g_form.showRelatedList('sc_cat_item_location_no_mtom');
		g_form.showRelatedList('sc_cat_item_user_mtom');
		g_form.showRelatedList('sc_cat_item_user_no_mtom');
	} else {
		g_form.hideRelatedList('sc_cat_item_company_mtom');
		g_form.hideRelatedList('sc_cat_item_company_no_mtom');
		g_form.hideRelatedList('sc_cat_item_dept_mtom');
		g_form.hideRelatedList('sc_cat_item_dept_no_mtom');
		g_form.hideRelatedList('sc_cat_item_group_mtom');
		g_form.hideRelatedList('sc_cat_item_group_no_mtom');
		g_form.hideRelatedList('sc_cat_item_location_mtom');
		g_form.hideRelatedList('sc_cat_item_location_no_mtom');
		g_form.hideRelatedList('sc_cat_item_user_mtom');
		g_form.hideRelatedList('sc_cat_item_user_no_mtom');
	}
	
	//Hiding Service Fulfillment Steps
	var SERVICE_FULFILLMENT_RELATED_LIST = 'REL:285ba9da44312010f877dc313e5b811d_list';
	if (g_form.getRelatedListNames().indexOf(SERVICE_FULFILLMENT_RELATED_LIST) >= 0)
		g_form.hideRelatedList(SERVICE_FULFILLMENT_RELATED_LIST);
}
