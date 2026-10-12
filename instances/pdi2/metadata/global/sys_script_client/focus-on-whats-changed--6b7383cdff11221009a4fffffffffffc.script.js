function onLoad() {
    var url = new GlideURL(window.location.href);
    var index = g_tabs2List.findTabIndexByName("sys_atf_test_result.sys_atf_what_changed.sys_atf_test_result");
    if (url.params["sysparm_find_changes"] !== undefined && index > -1) {
        g_tabs2List.setActive(index);
    }

}
