var log = new GSLog('com.snc.on_call_rotation.log.level', "On-Call: Assign by Acknowledgement Email Inbound Action");
var emailType = new global.OnCallConstants().COMMUNICATION_CHANNEL.EMAIL;
var flowUtils = new global.OnCallFlowUtils();
var userId = getUserId(email);
var isSubFlow = flowUtils.isSubflow(current, userId);
var keywords, userResponse;
if (isSubFlow) {
    var commUtils = new global.OnCallCommunicationUtils();
    var commConfigGr = commUtils.getApplicableCommConfigRecordsForChannelTypes(current.getTableName(), current.getUniqueValue(), emailType);
    if (commConfigGr.next()) {
        keywords = commUtils.getParsedKeyWords(commConfigGr, userId);
        userResponse = flowUtils.parseEmailResponse(email.body_text, keywords);
        if (log.atLevel(GSLog.DEBUG))
            log.logDebug('[process] user response: ' + userResponse);

        new OnCallAssignByAck()
            .setRecord(current)
            .setEmail(email)
            .setUser(userId)
            .setUserResponse(userResponse)
            .setIsSubflow(true)
            .process();

        new OnCallCommunicationProviderUtil().callProcessResponse(emailType, current, userResponse, {
            "userId": userId
        });
    } else {
        gs.error("No config record for email");
    }

} else {
    keywords = {
        "accept_keyword": "ACC",
        "reject_keyword": "REJ"
    };
    userResponse = flowUtils.parseEmailResponse(email.body_text, keywords);
    if (log.atLevel(GSLog.DEBUG))
        log.logDebug('[process] user response: ' + userResponse);

    new OnCallAssignByAck()
        .setRecord(current)
        .setEmail(email)
        .setUser(userId)
        .setUserResponse(userResponse)
        .process();
}

function getUserId(email) {
    var userId = gs.getUserID();

    // For non-primary email devices system can not find a user with "from" email and it runs in guest session
    if (gs.nil(email.user_id)) {
        var notifGr = new GlideRecord("cmn_notif_device");
        notifGr.addQuery("email_address", email.fromAddress);
        notifGr.setLimit(1);
        notifGr.query();
        if (notifGr.next()) {
            userId = notifGr.getValue("user");

            // For reject case sys_email is queried with processed user's id, populating user_id field to make the email traceable for reject case
            populateUserToEmail(sys_email.sys_id, userId);
        }

    }
    return userId;
}

function populateUserToEmail(emailId, userId) {
    if (gs.nil(emailId) || gs.nil(userId)) return;
    var emailGr = new GlideRecord("sys_email");
    if (emailGr.get(emailId)) {
        emailGr.setValue("user_id", userId);
        emailGr.setValue("user", userId);
        emailGr.setWorkflow(false);
        emailGr.update();
    }
}
