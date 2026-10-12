function onClick() {
var link = "/sys_m2m_template.do?sys_is_list=true&sys_is_related_list=true&sys_target=scan_check_suite_check&sysparm_checked_items=&sysparm_collection=scan_check_suite&sysparm_collectionID=" + g_form.getUniqueValue() + "&sysparm_collection_key=suite&sysparm_collection_label=Checks&sysparm_collection_related_field=check&sysparm_collection_related_file=scan_check&sysparm_collection_relationship=&sysparm_fixed_query=&sysparm_group_sort=&sysparm_list_css=&sysparm_m2m_ref=scan_check_suite_check&sysparm_query=&sysparm_referring_url=" + location.pathname + "&sysparm_stack=no&sysparm_target=&sysparm_view=";
var win = top.window.open(link, '_self');
win.focus();
}
