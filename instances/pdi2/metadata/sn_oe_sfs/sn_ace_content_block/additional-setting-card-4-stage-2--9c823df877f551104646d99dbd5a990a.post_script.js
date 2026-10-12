(function(context, pageParams) {
    context.props_details.subtitle = gs.getMessage('Define assignment groups');
    context.props_details.key = 'CONFIGURE_ASSIGNMENT_GROUPS';
    context.props_details.label = gs.getMessage('Set up groups');
    context.props_details.image = '/images/awa-define-assignment-groups.png';
    context.props_details.desc = gs.getMessage('Dynamically map agents’ skillsets to your org’s unique work item queues.');
    context.props_details.icon = 'open-link-right-fill';
    context.props_details.link = '/sys_user_group_list.do?sysparm_query=sys_idINjavascript%3AgetGroupsAssociatedWithQueues()&sysparm_view=advanced_work_assignment';
    //by default this card is hidden and show more is enabled. the flag is toggled when see more is clicked
    context.props_details.show = false;
})(context, pageParams);
