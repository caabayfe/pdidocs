(function executeRule(current, previous /*null when async*/ ) {
    try {
        var catalog = current.connection_name;
        var DataFabricConnectionDetailsUtil = new global.DataFabricConnectionDetailsUtil();
        var mappedTablecount = 0;
        mappedTablecount = DataFabricConnectionDetailsUtil.getCountOfMappedTableToConnection(catalog);

        if (mappedTablecount > 0) {
            gs.addErrorMessage(gs.getMessage("There are {0} data tables associated with this connection", [mappedTablecount]));
            gs.addInfoMessage(gs.getMessage("To permanently delete this connection, these data tables need to be deleted"));
            current.setAbortAction(true);
        }

    } catch (e) {
        gs.addErrorMessage(gs.getMessage("Business Rule: Validate Connection Metadata Deletion exception - {0}", [e]));
        current.setAbortAction(true);
    }

})(current, previous);
