var messages = event.parm2.split(",");
var grUser = new GlideRecord("sys_user");
grUser.addQuery("sys_id", event.parm1);
grUser.query();

var utils = new LiveMessageUtils();
var liveMessagesGroup = utils.getGroup(messages[0]);
var queueID = utils.getQueueID(liveMessagesGroup.id);
if(liveMessagesGroup) {
	var liveMessagesProfile = utils.getProfile(messages[0]);
	grUser.next();
	var userName = grUser.getDisplayValue("first_name") + " " + grUser.getDisplayValue("last_name");
	template.print("<h2 style='color: #424E5B;margin: 0 0 12px;line-height: 26px;margin-bottom: 12px'>Hello " + userName + ",</h2>");
	var profileName = liveMessagesProfile.displayValue;
	email.setSubject("New Message(s) from " + profileName);
	if(queueID)
		template.print("<p style='font-size: 17px;margin: 0 0 16px;line-height: 24px'><a href='/$connect_redirect.do?sysparm_queueID=" + queueID + "&sysparm_channelID=" + liveMessagesGroup.id + "'>You have ");
	else
		template.print("<p style='font-size: 17px;margin: 0 0 16px;line-height: 24px'><a href='/$connect_redirect.do?sysparm_channelID=" + liveMessagesGroup.id + "'>You have ");

	if(messages.length > 1) {
		template.print(messages.length + " new messages ");
	} else {
		template.print("a new message ");
	}
	
	template.print("from " + profileName + ".</a></p>");

	var grLiveProfile = new GlideRecord("live_profile");
	if(grLiveProfile.get(liveMessagesProfile.id)) {
		var grUser = new GlideRecord("sys_user");
		if(grUser.get(grLiveProfile.getValue("document"))) {
			email.setReplyTo(grUser.getValue("email"));
		}
	}
}
