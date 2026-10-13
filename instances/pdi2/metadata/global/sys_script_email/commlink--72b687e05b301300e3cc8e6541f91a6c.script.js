(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {

    // Add your code here
    var incidentGr = current.task.comm_plan.source.getRefRecord();
    var iatGr = current.task.getRefRecord();
    var mimState = incidentGr.major_incident_state;

    var sourceSysId, sourceTable, params, url, commLink;

    if (mimState == 'accepted' || mimState == 'proposed') {
        sourceSysId = incidentGr.getUniqueValue();
        sourceTable = incidentGr.getTableName();
        params = {
            table: sourceTable,
            sysId: sourceSysId
        };
        url = new global.EmailNotificationRedirection().getLink(sourceTable, sourceSysId, "mim", params);
        commLink = '<a href="' + url + '"><strong>' + incidentGr.getValue("number") + '</strong></a>';
    } else {
        sourceSysId = iatGr.getUniqueValue();
        sourceTable = iatGr.getTableName();
        params = {
            table: sourceTable,
            sysId: sourceSysId
        };
        url = new global.EmailNotificationRedirection().getLink(sourceTable, sourceSysId, "record", params);
        commLink = '<a href="' + url + '"><strong>' + iatGr.getValue("number") + '</strong></a>';
    }

    template.print(commLink);

})(current, template, email, email_action, event);
