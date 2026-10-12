(function(context, pageParams) {
    context.props_details.subtitle = gs.getMessage('Customize presence states');
    context.props_details.key = 'CONFIGURE_PRESENCE_STATES';
    context.props_details.label = gs.getMessage('Set up presence states');
    context.props_details.image = '/images/awa-customize-presence-states.png';
    context.props_details.desc = gs.getMessage('Tailor agents’ availability statuses—online, offline, away, and more—to fit the needs of your org.');
    context.props_details.icon = 'open-link-right-fill';
    context.props_details.link = '/awa_presence_state_list.do';
})(context, pageParams);
