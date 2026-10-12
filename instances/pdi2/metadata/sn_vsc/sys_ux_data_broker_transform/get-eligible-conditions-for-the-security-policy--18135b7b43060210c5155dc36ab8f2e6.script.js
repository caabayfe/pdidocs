function transform(input) {
    var id = input && input.sys_id;
    var resp = {
        "conditions": []
    };
    if (id) {
        var scConstants = new sn_vsc.SecurityCenterConstants();
        var util = new SCSecurityPolicyUtil();
        var res = util.getEligiblePolicyConditions(id);
        resp.conditions = res.conditions;
    }
    return resp;
}
