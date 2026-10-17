function transform(input) {
    var resp = {
        "what_next": "",
        "hardening_setting": {
            "name": "",
            "sysId": ""
        }
    };
    var gr = new GlideRecord("sn_vsc_instance_hardening_settings");
    gr.addQuery("compliance_status", "non-compliant");
    gr.orderByDesc("score_impact");
    gr.setLimit(1);
    gr.query();
    if (gr.next()) {
        const hardeningSettingName = gr.getDisplayValue();
        resp["what_next"] = "Improve your hardening score by " + gr.getValue("score_impact") + "% addressing, " + hardeningSettingName + ", the next non-compliant setting";
        resp["hardening_setting"] = {
            "name": hardeningSettingName,
            "sysId": gr.getValue("sys_id")
        };
    }
    return resp;
}
