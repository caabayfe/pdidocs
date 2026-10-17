(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {

    var incidentGr = current.comm_plan.source.getRefRecord();
    var mimState = incidentGr.major_incident_state;
    var MAJOR_INCIDENT_STATE = new sn_major_inc_mgmt.MajorIncidentTriggerRules().MAJOR_INCIDENT_STATE;
    if (mimState == MAJOR_INCIDENT_STATE.ACCEPTED || mimState == MAJOR_INCIDENT_STATE.PROPOSED)
        template.print("Conference call initiated for Major Incident " + incidentGr.getValue('number') + "<br/><br/>");
    else
        template.print("Conference call initiated for Incident " + incidentGr.getValue('number') + "<br/><br/>");

    if (current.comm_plan.source.getRefRecord().getValue('short_description'))
        template.print("<b>Short description</b>: " + current.comm_plan.source.getRefRecord().getValue('short_description') + "<br/>");
    if (current.comm_plan.source.getRefRecord().getValue('description'))
        template.print("<b>Description</b>: " + current.comm_plan.source.getRefRecord().getValue('description') + "<br/>");

    var sourceSysId, sourceTable, params, url;

    if (mimState == MAJOR_INCIDENT_STATE.ACCEPTED || mimState == MAJOR_INCIDENT_STATE.PROPOSED) {
        sourceSysId = incidentGr.getUniqueValue();
        sourceTable = incidentGr.getTableName();
        params = {
            table: sourceTable,
            sysId: sourceSysId
        };
        url = new global.EmailNotificationRedirection().getLink(sourceTable, sourceSysId, "mim", params);
        var mimAnchor = "<a href='" + url + "'>" + "View Incident</a>";
        template.print("<br/>" + "Click on the link to view Major Incident: " + mimAnchor + "<br/>");
    }
    sourceSysId = current.getUniqueValue();
    sourceTable = current.getTableName();
    params = {
        table: sourceTable,
        sysId: sourceSysId
    };
    url = new global.EmailNotificationRedirection().getLink(sourceTable, sourceSysId, "record", params);

    var conferenceAnchor = "<a href='" + url + "'>" + current.getValue('number') + "</a>";
    template.print("Click on the link to join the conference call: " + conferenceAnchor);

})(current, template, email, email_action, event);
