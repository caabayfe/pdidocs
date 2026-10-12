var wizID = "11c8b3c1c32032007bf1bea192d3aed7";

var uri = action.getGlideURI();
uri.set('sys_id', '-1');
uri.set('sysparm_parent', wizID);
uri.deleteParmameter('sysparm_referring_url');
uri.deleteMatchingParameter('sysparm_list_');
uri.deleteMatchingParameter('sysparm_record_');
uri.deleteParmameter('sys_is_list');
uri.deleteParmameter('sys_is_related_list');
uri.deleteParmameter('sys_submitted');
uri.deleteParmameter('sysparm_checked_items');
uri.deleteParmameter('sysparm_ref_list_query');
uri.deleteParmameter('sysparm_current_row');

uri.set('sysparm_referring_url', uri.toString());
uri.deleteMatchingParameter('fancy.');
uri.deleteMatchingParameter('sys_rownum');
uri.deleteMatchingParameter('sysparm_encoded');
uri.deleteMatchingParameter('sysparm_query_encoded');
uri.deleteParmameter('sysparm_refer');

action.setRedirectURL(uri.toString('wizard_view.do'));
action.setNoPop(true);
