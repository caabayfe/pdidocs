(function executeRule(current, previous /*null when async*/ ) {
    var targetTable = current.table_name; // Target record's table
    var targetSysId = current.table_sys_id; // Target record's sys_id

    if (targetTable == "ds_document_version" && current.operation() == "delete") {
        var docVerGR = new GlideRecord(targetTable);

        if (docVerGR.get(targetSysId)) {
            var action = "removed";
            var message = `The attachment "${current.file_name}" has been removed by ` + gs.getUser().getFirstName();

            var discussionElement = docVerGR.getElement('discussion');
            // Add the log to work notes
            discussionElement.setJournalEntry(message);
            docVerGR.update();

            gs.info(`[Attachment Tracking] ${message} for record: ${docVerGR.getDisplayValue()}`);
        }
    }
})(current, previous);
