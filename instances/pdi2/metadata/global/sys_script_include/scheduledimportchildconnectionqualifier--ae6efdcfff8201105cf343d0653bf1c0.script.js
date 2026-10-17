var ScheduledImportChildConnectionQualifier = Class.create();
ScheduledImportChildConnectionQualifier.prototype = {
    initialize: function() {},

    getChildQualifier: function(scheduledImport) {

        var answer = 'parent=NO_MATCH';
        var dataSource = new GlideRecord('sys_data_source');
        if (dataSource.get(current.getValue('data_source'))) {
            var flowAction = new sn_impex.FlowActionConnectionUtility();
            if (dataSource.type == 'data_stream') {
                var dataStreamAlias = flowAction.forFlowAction(dataSource.getValue('data_stream_action'));
                if (dataStreamAlias)
                    answer = 'sys_id=' + dataStreamAlias + '^ORparent=' + dataStreamAlias;
            } else if (dataSource.type == 'REST') {
                var restAlias = flowAction.forFlowAction(dataSource.getValue('request_action'));
                if (restAlias)
                    answer = 'sys_id=' + restAlias + '^ORparent=' + restAlias;
            } else if (dataSource.type == 'CUSTOM') {
                answer = '';
            }
        }
        return answer;
    },

    type: 'ScheduledImportChildConnectionQualifier'
};
