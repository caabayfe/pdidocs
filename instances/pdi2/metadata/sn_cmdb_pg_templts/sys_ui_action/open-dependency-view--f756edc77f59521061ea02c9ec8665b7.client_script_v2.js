function onClick(g_form) {
    var sys_id = g_form.getUniqueValue();
    var url = '/nav_to.do';
    url += '?uri=/$ngbsm.do?id=' + sys_id;
    open(url);
}
