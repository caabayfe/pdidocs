function transform(input) {
    var id = input && input.sys_id;
    var resp = {
        "notifications_for_ui": [],
        "existingNotificationsOfPolicyIds": []
    };
    if (id) {
        var util = new SCSecurityPolicyUtil();
        var res = util.getExistingPolicyNotifications(id);
        resp.notifications_for_ui = res.data;
        resp.existingNotificationsOfPolicyIds = res.existingIds;
    }
    return resp;
}
