function onClick(g_form) {
    var sys_id = g_form.getUniqueValue();
    var query = "cmdb_ci=" + sys_id;
    g_aw.openRecord("change_request", "-1", {
        "query": query
    });
}
