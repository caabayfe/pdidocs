(function(context, pageParams) {
    context.props_details.subtitle = gs.getMessage('Determine agent capacity');
    context.props_details.key = 'DETERMINE_AGENT_CAPACITY';
    context.props_details.label = gs.getMessage('Set up universal capacity');
    context.props_details.image = '/images/awa-determine-agent-capacity.png';
    context.props_details.desc = gs.getMessage('Configure your team’s maximum universal capacity to prevent agents from being assigned too many work items.');
    context.props_details.icon = 'open-link-right-fill';
    context.props_details.link = '/awa_agent_universal_capacity_list.do';
})(context, pageParams);
