function onClick() {
    var result = g_form.submit('sysverb_ws_save');
    if (!result) {
        //failed form submission
        return;
    }
    result.then(function() {
        var params = {};
        params.sysparm_parent_table = "incident";
        params.sysparm_parent_sys_id = g_form.getUniqueValue();
        g_service_catalog.openCatalogItem('sc_cat_item', '-1', params);
    });
}
