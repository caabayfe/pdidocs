function transform(input) {
    var id = input && input.sys_id;
    var resp = {
        "notifications": []
    };
    if (id) {
        var scConstants = new sn_vsc.SecurityCenterConstants();
        var util = new SCSecurityPolicyUtil();
        var res = util.getEligiblePolicyNotifications(id);
        resp.notifications = res;
    }
    return resp;
}
