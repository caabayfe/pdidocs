function onLoad() {
    var gr = new GlideRecord("sn_em_arm_additional_info");
    var ruleId = g_form.getUniqueValue();
    gr.addQuery("alert_management_rule", ruleId);
    gr.query();
    if (gr.next()) {
        var addInfoId = gr.getValue("sys_id");
        var message = getMessage('This rule has an <u><a target="_blank" href="/nav_to.do?uri=%2Fsn_em_arm_additional_info.do%3Fsys_id%3D{0}">additional info record</a></u>').withValues([addInfoId]);
        g_form.addInfoMessage(message);
    }
}
