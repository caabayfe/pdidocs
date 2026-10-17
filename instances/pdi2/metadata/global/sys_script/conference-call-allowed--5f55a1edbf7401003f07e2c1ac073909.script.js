//value used in UI Action to check if the action should be displayed
// on the form
g_scratchpad.conferenceCallAllowed = true;
g_scratchpad.allowedToJoin = true;
g_scratchpad.allowedToEnd = true;
g_scratchpad.setupCorrectly = (JSUtil.notNil(gs.getProperty('com.snc.iam.notify_number', ''))) || (gs.getProperty('com.snc.iam.enable_notify', '') === 'true');

// check if this incident alert has any active conference calls associated with it
var gr = new GlideRecord('notify_conference_call');
gr.addEncodedQuery("active=true^source=" + current.sys_id);
gr.query();

// check if there are any active conference calls related to the current incident alert
if (gr.getRowCount() > 0) {
    // set scratchpad value to false so the UI action to
    // initiate a conference call is hidden
    g_scratchpad.conferenceCallAllowed = false;
}

if (!g_scratchpad.conferenceCallAllowed) {
    gr.next();
    g_scratchpad.activeCallId = gr.getValue('sys_id');
    var participant = new GlideRecordSecure('notify_participant');
    participant.addActiveQuery();
    participant.query('notify_conference_call', g_scratchpad.activeCallId);
    // iterate over participants
    while (participant.next()) {
        var number = participant.getValue('phone_number');
        var user;
        if (participant.getValue('user')) {
            user = participant.getValue('user');
        } else {
            user = new NotifyUtil().getUserByNumber(number);
        }
        if (user == gs.getUserID()) {
            g_scratchpad.allowedToJoin = false;
            break;
        }
    }
} else {
    g_scratchpad.allowedToJoin = false;
    g_scratchpad.allowedToEnd = false;
}
