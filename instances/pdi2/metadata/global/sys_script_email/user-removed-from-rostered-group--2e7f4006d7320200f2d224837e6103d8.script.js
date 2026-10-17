(function runMailScript(current, template, email, email_action, event) {
    var userGroup = (event.parm1 + '').split(',');
    var userSysID = userGroup[0];
    var groupSysID = userGroup[1];
    var emailNotifRedirect = new global.EmailNotificationRedirection();
    var params = {
        "userSysId": userSysID,
        "groupSysId": groupSysID
    };
    var link = emailNotifRedirect.getLink(null, null, "oc_user_members", params);
    var userGr = new GlideRecord('sys_user');
    userGr.get(userSysID);
    var groupGr = new GlideRecord('sys_user_group');
    groupGr.get(groupSysID);
    var subject = gs.getMessage("Please note that user {0} has been removed from group {1}", [userGr.name, groupGr.name]);
    email.setSubject(subject);
	var message = gs.getMessage("Please note that the user {0} has been removed from the group {1}. To take action(s), click <a href='{2}'>here</a>", [userGr.name, groupGr.name, link]);
    template.print(message);
	template.print("<br />");

	var removedMessage = gs.getMessage("On-Call coverage provided by this user {0} has been deleted, if cover is still required please assign a member of this group {1}.", [userGr.name, groupGr.name]);
	template.print(removedMessage);
})(current, template, email, email_action, event);
