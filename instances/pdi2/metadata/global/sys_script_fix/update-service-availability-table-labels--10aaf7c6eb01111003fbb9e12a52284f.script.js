renameTableLabel("service_availability", "absolute_count", "Total outages", "Total outage periods", "Total outage periods");
changeHint("service_availability", "absolute_count", "Total number of outages in this interval (independent of schedule)", "Number of continuous outage periods for the entire availability interval");

renameTableLabel("service_availability", "scheduled_count", "Commitment outages", "Commitment outage periods", "Commitment outage periods");
changeHint("service_availability", "scheduled_count", "Number of outages against this commitment's schedule in this interval", "Number of continuous outage periods within the commitment's schedule");

changeHint("service_availability", "absolute_downtime", "Wall clock downtime (independent of schedule)", "Total downtime for the entire availability interval (independent of schedule)");

changeHint("service_availability", "scheduled_downtime", "Downtime that counts against this commitment's schedule", "Downtime within the commitment's schedule");

changeHint("service_availability", "ast", "Total expected service availability for this commitment", "Expected uptime within the commitment's schedule ");
changeHint("service_availability", "allowed_downtime", "Acceptable amount of downtime againt this commitment's schedule for this interval", "Acceptable amount of downtime against the commitment's schedule for this interval");

//Execution time from background script
//[0:00:02.369] Script completed in scope global: script i.e. 2369 ms

function renameTableLabel(tableName, elementName, previousLabel, targetLabel, plural) {
    gs.log("About to change label", " SPM Service Availability Fix Script");
    var dbObj = new GlideRecord("sys_documentation");
    dbObj.addQuery("name", tableName);
    dbObj.addQuery("element", elementName);
    dbObj.query();
    if (dbObj.next()) {
        var currentLabel = dbObj.getValue("label");
        if (currentLabel != previousLabel) {
            gs.log("No need to change label", "SPM Service Availability  Fix Script");
            return;
        }
        dbObj.setValue("label", targetLabel);
        dbObj.update();
        gs.log(targetLabel, "SPM Service Availability  Fix Script : Changed lable");
    } else {
        gs.log(tableName, "SPM Service Availability Fix Script : Table not found in sys_documentation");
    }

    // Modify plural in sys_documentation table
    var docObj = new GlideRecord("sys_documentation");
    docObj.addQuery("name", tableName);
    docObj.addQuery("element", elementName);
    docObj.query();
    if (docObj.next()) {
        var currentPlural = docObj.getValue("plural");
        if (currentPlural != plural) {
            gs.log(plural, "SPM Service Availability Fix Script : Changing plural");
            docObj.setValue("plural", plural);
            docObj.update();
        }
    } else {
        gs.log(tableName, "SPM Service Availability Fix Script : Table not found in sys_documentation");
    }

    gs.log(tableName, "SPM Service Availability Fix Script : Done changing label of table");
}

function changeHint(tableName, elementName, previousHint, targetHint) {
    gs.log("About to change hint", " SPM Service Availability Fix Script");
    var docObj = new GlideRecord("sys_documentation");
    docObj.addQuery("name", tableName);
    docObj.addQuery("element", elementName);
    docObj.query();
    if (docObj.next()) {
        var currentHint = docObj.getValue("hint");
        if (currentHint != previousHint) {
            gs.log("No need to change hint", "SPM Service Availability  Fix Script");
            return;
        }
        docObj.setValue("hint", targetHint);
        docObj.update();
    }

}
