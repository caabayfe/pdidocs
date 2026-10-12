copyDataPolicyActions();

function copyDataPolicyActions() {
    var gr = new GlideRecord("sys_data_policy_rule");
    if (!gr.isValid())
        return;

    gr.addQuery("sys_data_policy", current.sys_overrides);
    gr.query();
    while (gr.next()) {
        gr.sys_data_policy = current.getUniqueValue();
        gr.insert();
    }
}        
