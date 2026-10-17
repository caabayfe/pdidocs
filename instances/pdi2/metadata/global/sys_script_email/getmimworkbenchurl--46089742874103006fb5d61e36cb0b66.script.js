(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {
    var sourceIncidentGr = current.incident_alert.source_incident.getRefRecord();
    var sourceSysId = sourceIncidentGr.getUniqueValue();
    var sourceTable = sourceIncidentGr.getTableName();
    var params = {
        table: sourceTable,
        sysId: sourceSysId
    };
    var url = new global.EmailNotificationRedirection().getLink(sourceTable, sourceSysId, "mim", params);
    var text = "Take me to the Incident";
    template.print("<a href='" + url + "'>" + text + "</a>");
})(current, template, email, email_action, event);
