logActivity(current, previous);

function logActivity(c, p) {
    var notifyUtils = new NotifyUtil();
    var number = c.getValue('phone_number');
    var user;
    if (c.getValue('user')) {
        var userSysId = c.getValue('user');
        var userGr = new GlideRecord('sys_user');
        if (userGr.get(userSysId)) {
            user = userGr;
        }
    } else {
        user = notifyUtils.getUserByNumber(number, true);
    }
    var name = (notifyUtils.isDefined(user)) ? user.name : number;
    var ia = new GlideRecord("incident_alert");
    ia.get(c.notify_conference_call.source);
    if (!ia.isValid())
        return;
    // check for the status changes we want to log to the IA's activity log
    if (c.active && p.muted && !c.muted) {
        ia.comments = gs.getMessage("{0} was unmuted", name);
        ia.update();
    } else if (c.active && c.muted && !p.muted) {
        ia.comments = gs.getMessage("{0} was muted", name);
        ia.update();
    }
}
