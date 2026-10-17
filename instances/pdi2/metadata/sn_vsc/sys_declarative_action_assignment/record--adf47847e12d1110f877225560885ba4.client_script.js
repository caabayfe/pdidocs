function onClick() {
    var gaMetric = new GlideAjax('sn_vsc.VSCScanAjaxProcessor');
    gaMetric.addParam('sysparm_metric_event', 'suite_ui_schedule_tab_new_button_clicked');
    gaMetric.addParam('sysparm_name', 'collectUsageMetricWithParam');
    gaMetric.getXML(dummy);
    
    function dummy(response) {}
    
    var ga = new GlideAjax('sn_vsc.VSCScanAjaxProcessor');
    ga.addParam('sysparm_name', 'getOrCreateCombo');
    ga.addParam('sysparm_suite_sys_id', g_form.getUniqueValue());
    ga.addParam('sysparm_target_table', "");
    ga.addParam('sysparm_target_sys_ids', "[]");
    ga.getXML(openNewRecord);

    function openNewRecord(response) {
        var answer = response.responseXML.documentElement.getAttribute("answer");
        if (answer) {
            var link = location.pathname + "/sub/record/sysauto_scan/-1_uid_1/params/query/combo=" + answer + "^run_as=";
            var win = top.window.open(link, '_self');
            win.focus();
        }
    }
}
