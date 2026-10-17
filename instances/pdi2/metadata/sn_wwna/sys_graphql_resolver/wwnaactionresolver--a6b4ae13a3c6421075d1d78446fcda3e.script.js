(function process( /*ResolverEnvironment*/ env) {

    var wwna_table = "wwna_quick_actions";

    var quickActions = sn_snippets.QuickAction.loadActions(env.getArguments()['table'],
        env.getArguments()['sysId'], wwna_table);
    quickActions = JSON.parse(quickActions);

    //fetch common action
    var commonActions = sn_snippets.QuickAction.loadActions('sys_one_extend_capability', 'f8fdd6ca43520210fbb28b11afb8f226', wwna_table);
    commonActions = JSON.parse(commonActions);

    //merge both the actions
    var result = quickActions.concat(commonActions);

    var wwnaActions = {};
    var wwnaActionsGr = new GlideRecord('wwna_quick_actions');
    wwnaActionsGr.query();

    while (wwnaActionsGr.next()) {
        wwnaActions[wwnaActionsGr.getValue("sys_id")] = {
            "actionType": wwnaActionsGr.getValue("action_type"),
            "actionGroup": wwnaActionsGr.getValue("action_group"),
			"tableName": wwnaActionsGr.getValue("table_name")
        };
    }

    // Include action type and group
    result.map(function(action) {
        wwnaAction = wwnaActions[action.sysId];

        action.actionType = wwnaAction["actionType"];
        action.actionGroup = wwnaAction["actionGroup"];
        action.tableName = wwnaAction["tableName"];
    });

    return result;
})(env);
