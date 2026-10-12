(function(action) {
	var uri = action.getGlideURI();
	uri.deleteParmameter('sysparm_referring_url');
	uri.deleteMatchingParameter('sysparm_list_');
	uri.deleteMatchingParameter('sysparm_record_');
	uri.deleteParmameter('sys_is_list');
	uri.deleteParmameter('sys_is_related_list');
	uri.deleteParmameter('sys_submitted');
	uri.deleteParmameter('sysparm_checked_items');
	uri.deleteParmameter('sysparm_ref_list_query');
	uri.deleteParmameter('sysparm_current_row');
	uri.deleteMatchingParameter('fancy.');
	uri.deleteMatchingParameter('sys_rownum');
	uri.deleteMatchingParameter('sysparm_encoded');
	uri.deleteMatchingParameter('sysparm_query_encoded');
	uri.deleteParmameter('sysparm_refer');
	
	uri.set("sysparm_referring_url", encodeURIComponent(uri.toString()));
	action.setNoPop(true);
	action.setRedirectURL("new_change_redirect.do?sn_new_change_referrer=" + encodeURIComponent(uri.toString("")));
})(action);
