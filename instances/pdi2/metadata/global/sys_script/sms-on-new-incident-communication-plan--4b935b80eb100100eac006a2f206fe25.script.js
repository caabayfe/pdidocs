// function to create the sms body
function createSMSBody(record) {
    var localizedMessage;
    var ciName = String((record.source_ci) ? record.source_ci.name : "");
    var args = [
        record.number,
        record.severity,
        record.event_type.replace("_", " "),
        ciName
    ];

    // build message
    if (record.event_type != "" && ciName != "") {
        localizedMessage = gs.getMessage("{0}: a {1} severity {2} incident communication plan for '{3}' has been opened", args);
    } else if (record.event_type != "") {
        localizedMessage = gs.getMessage("{0}: a {1} severity {2} incident communication plan has been opened", args);
    } else if (ciName != "") {
        localizedMessage = gs.getMessage("{0}: a {1} severity incident communication plan for '{3}' has been opened", args);
    } else {
        localizedMessage = gs.getMessage("{0}: a {1} severity incident communication plan has been opened", args);
    }

    return localizedMessage;
}

// function to send alerts
function sendAlerts(notify, incidentManagers) {
    var feedback = "";
    var from = gs.getProperty('com.snc.iam.notify_number', '').trim();
    var notifyUtils = new NotifyUtil();

    if (JSUtil.notNil(notify)) {
        for (var i = 0; i < incidentManagers.length; i++) {
            var manager = new GlideRecord('sys_user');
            manager.get(incidentManagers[i]);

            var numbers = notifyUtils.getUniquePhoneNumbersForUsersAndGroups([], [manager.sys_id + ''], [], notifyUtils.numberType.sms);
            if (numbers.length > 0) {
                notify.sendSMS(from, numbers[0], createSMSBody(current), current);
                var i18nMsg = gs.getMessage("Sent SMS to {0} {1}", [manager.first_name, manager.last_name]);
                feedback += i18nMsg + '\n';
            }
        }

        if (feedback != "") {
            current.comments = feedback;
            current.update();
        }
    } else {
        gs.addErrorMessage(gs.getMessage("The Notify plugin has to be activated in order so send notifications."));
    }

    return feedback;
}

// get all contacts
var notify = new SNC.Notify();
var incidentManagers = [];
var contacts = new GlideRecord('contact');
contacts.addQuery('table', 'incident_alert');
contacts.addQuery('document', current.sys_id);
contacts.addQuery('type', 'sys_user');
contacts.query();
while (contacts.next()) {
    incidentManagers.push(contacts.user.sys_id);
}

// send alerts and store result in global variable
var ataken_update = sendAlerts(notify, incidentManagers);
