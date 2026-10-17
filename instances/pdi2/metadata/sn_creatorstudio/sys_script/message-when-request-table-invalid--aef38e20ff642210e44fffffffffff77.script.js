(function executeRule(current, previous /*null when async*/ ) {
    if (current.request_table === previous.request_table)
        return;
    var tableName = current.request_table;
    if (!global.CreatorStudioRequestAppUtils.hasRequestType(tableName) || !global.CreatorStudioRequestAppUtils.baseTableExtendsTask(tableName)) {
        var infoMessage = gs.getMessage('Request App Config configuration updated for {0} with warnings (see below)', current.name);
        gs.addInfoMessage(infoMessage);
    }
})(current, previous);
