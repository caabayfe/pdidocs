(function executeRule(current, previous /*null when async*/ ) {

    var dataSource = new GlideRecord('sys_data_source');
    if (dataSource.get(current.getValue('data_source'))) {
        var flowAction = new sn_impex.FlowActionConnectionUtility();
        if (dataSource.type == 'data_stream') {
            var dataStreamAlias = flowAction.forFlowAction(dataSource.getValue('data_stream_action'));
            if (dataStreamAlias)
                setParentAlias(dataStreamAlias, current);
        } else if (dataSource.type == 'REST') {
            var restAlias = flowAction.forFlowAction(dataSource.getValue('request_action'));
            if (restAlias)
                setParentAlias(restAlias, current);
        }
    }

})(current, previous);

function setParentAlias(parentAlias, scheduledImport) {
    g_scratchpad.parent_connection_alias = parentAlias;
    if (scheduledImport.connection_override.nil())
        scheduledImport.setValue('connection_override', parentAlias);
}
