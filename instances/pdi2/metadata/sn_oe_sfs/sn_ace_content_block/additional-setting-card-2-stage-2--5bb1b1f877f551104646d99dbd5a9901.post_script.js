(function(context, pageParams) {
    context.props_details.subtitle = gs.getMessage('Configure reasons for rejection');
    context.props_details.key = 'CONFIGURE_REJECTION_REASONS';
    context.props_details.label = gs.getMessage('Set up reject reasons');
    context.props_details.image = '/images/awa-configure-reasons-for-rejection.png';
    context.props_details.desc = gs.getMessage('Define the reasons an agent may cite for declining a work item: busy with a customer, lack of expertise, taking a break, and more.');
    context.props_details.icon = 'open-link-right-fill';
    context.props_details.link = '/awa_reject_reason_list.do';
})(context, pageParams);
