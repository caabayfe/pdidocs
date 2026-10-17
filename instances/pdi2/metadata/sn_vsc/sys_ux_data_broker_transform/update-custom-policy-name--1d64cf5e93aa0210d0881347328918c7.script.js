function transform(input) {
    var id = input.sys_id;
    var policyName = input.policy_name;
    if (!policyName || !id) {
        return;
    }
    var gr = new GlideRecord("sn_vsc_security_policy");
    if (gr.get(id)) {
        gr.name = policyName;
        gr.update();
    }
}
