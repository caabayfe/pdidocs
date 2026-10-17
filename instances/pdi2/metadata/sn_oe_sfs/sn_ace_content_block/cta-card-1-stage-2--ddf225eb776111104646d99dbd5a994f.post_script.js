(function(context, pageParams) {
    context.props_details.title = sn_i18n.Message.getMessage('sn_oe_sfs','First');
    context.props_details.key = 'SETUP_SERVICE_CHANNELS';
    context.props_details.subtitle = sn_i18n.Message.getMessage('sn_oe_sfs','Create Service Channels');
    context.props_details.label = sn_i18n.Message.getMessage('sn_oe_sfs','Set up service channels');
    context.props_details.image = '/images/awa-create-service-channels.png';
    context.props_details.desc = sn_i18n.Message.getMessage('sn_oe_sfs','Assign types and scopes of work to agents through out-of-the-box or custom service channels.');
    context.props_details.icon = 'open-link-right-fill';
    context.props_details.link = '/awa_service_channel_list.do';
})(context, pageParams);
