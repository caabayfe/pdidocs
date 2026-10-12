(function executeRule(current, previous /*null when async*/ ) {
    if (current.request_table === previous.request_table)
        return;

    var tableName = current.request_table;
    var isPublic = global.CreatorStudioRequestAppUtils.tableIsPublic(tableName);

    if (!isPublic) {
        var infoMessage = gs.getMessage('Unable to change table. The table you select must allow for updates from all application scopes.');
        gs.addErrorMessage(infoMessage);
        current.setAbortAction(true);
    }
})(current, previous);
