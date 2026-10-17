(function(context, pageParams) {
    context.props_details.subtitle = gs.getMessage('Set up Agent Affinity');
    context.props_details.key = 'CONFIGURE_AGENT_AFFINITY';
    context.props_details.label = gs.getMessage('Set up Agent Affinity');
    context.props_details.image = '/images/awa_setup_agent_affinity.png';
    context.props_details.desc = gs.getMessage("Assign work items by an agent's work history, related task, or account team affinity.");
    context.props_details.icon = 'open-link-right-fill';
    context.props_details.link = '/awa_affinity_rule_list.do';
})(context, pageParams);
