var WorkflowContentFilteringTableChoices = Class.create();
WorkflowContentFilteringTableChoices.prototype = {
    initialize: function() {},
    type: 'WorkflowContentFilteringTableChoices',

    process: function() {
        var list = [];
        if (gs.hasRole(PADConstants.ROLES.PD_ADMIN_ROLE)) {
            list = PDConstants.CONTENT_FILTER_TABLES || [PDConstants.TABLES.PD_ACTIVITY_DEFINITION];
        }
        if (gs.hasRole(PADConstants.ROLES.ADMIN_ROLE)) {
            list.push(
                'sys_flow_context',
                'sys_flow_step_definition',
                'sys_hub_action_type_definition',
                'sys_hub_category',
                'sys_hub_flow_logic_definition',
                'sys_hub_flow',
                'sys_hub_trigger_category',
                'sys_hub_trigger_definition',
                'sys_hub_ui_element',
                'sys_hub_ui_section',
                'sys_ih_external_event_source',
                'sys_ih_external_webhook'
            );
        }

        return list;
    },
};
