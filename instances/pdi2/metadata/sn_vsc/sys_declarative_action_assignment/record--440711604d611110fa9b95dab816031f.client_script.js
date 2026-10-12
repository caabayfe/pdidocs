function onClick() {
var id = g_form.getUniqueValue();
var key = '';
var label = '';
var related_field = '';
if (g_list.getListName().endsWith('parent_suite')) {
    key = 'parent_suite';
    label = 'Child+Suites';
    related_field = 'child_suite';
} else if (g_list.getListName().endsWith('child_suite')) {
    key = 'child_suite';
    label = 'Parent+Suites';
    related_field = 'parent_suite';
} else {
    return false;
}
var link = "/sys_m2m_template.do?sys_is_list=true&sys_is_related_list=true&sys_target=scan_check_suite_m2m&sysparm_checked_items=&sysparm_collection=scan_check_suite&sysparm_collectionID=" + id + "&sysparm_collection_key=" + key + "&sysparm_collection_label=" + label + "&sysparm_collection_related_field=" + related_field + "&sysparm_collection_related_file=scan_check_suite&sysparm_collection_relationship=&sysparm_fixed_query=&sysparm_group_sort=&sysparm_list_css=&sysparm_m2m_ref=scan_check_suite_m2m&sysparm_query=&sysparm_referring_url=" + location.pathname + "&sysparm_stack=no&sysparm_target=&sysparm_view=";
var win = top.window.open(link, '_self');
win.focus();
}
