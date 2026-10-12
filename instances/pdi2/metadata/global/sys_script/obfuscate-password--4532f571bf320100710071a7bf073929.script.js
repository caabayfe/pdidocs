var OBFUSCATED_DATA = "The event param has been excluded as a security precaution.";
    var emailLog = getEmailLog();
    if (emailLog != null) {
        current.body = "The email body has been excluded as a security precaution.";
        current.body_text = "The email body text has been excluded as a security precaution.";
        current.subject = "The email subject has been excluded as a security precaution.";
        obfuscateRelatedEventRecords(emailLog);
    }

    function getEmailLog() {
        var encodedQuery = "notification.event_name=pwd.email.trigger^ORnotification.event_name=password.reset^ORnotification.event_name=password.reset.url";
        var logGR = new GlideRecord('sys_email_log');
        logGR.addQuery('email', current.sys_id);
        logGR.addEncodedQuery(encodedQuery);
        logGR.query();
        if (!logGR.next()) {
            return null;
        }
        return logGR;
    }

    function obfuscateRelatedEventRecords(logGR) {
        var eventGR = new GlideRecord('sysevent');
        if (!eventGR.get(logGR.event)) {
            return;
        }

        eventGR.parm2 = OBFUSCATED_DATA;
        eventGR.update();
    }
