(function(context, pageParams) {
    context.props_details.subtitle = gs.getMessage('Set up shift-based assignment');
    context.props_details.key = 'CONFIGURE_SHIFT_BASED_ASSIGNMENT';
    context.props_details.label = gs.getMessage('Set up Shift-based Assignment');
    context.props_details.image = '/images/awa_setup_shift_based_assignment.png';
    context.props_details.desc = gs.getMessage("Assign work items to agents based on their shifts.");
    context.props_details.icon = 'open-link-right-fill';
    context.props_details.link = '/awa_assignment_rule_list.do';
})(context, pageParams);
