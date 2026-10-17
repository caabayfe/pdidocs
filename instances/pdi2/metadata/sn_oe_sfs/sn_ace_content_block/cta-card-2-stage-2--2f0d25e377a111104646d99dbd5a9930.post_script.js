(function(context, pageParams) {
    context.props_details.title = sn_i18n.Message.getMessage('sn_oe_sfs','Second');
    context.props_details.key = 'SETUP_QUEUES';
    context.props_details.subtitle = sn_i18n.Message.getMessage('sn_oe_sfs','Configure work item queues');
    context.props_details.label = sn_i18n.Message.getMessage('sn_oe_sfs','Set up queues');
    context.props_details.image = '/images/awa-config-work-item-queues.png';
    context.props_details.desc = sn_i18n.Message.getMessage('sn_oe_sfs','Determine the routing destination and sort order for your org’s work items.');
    context.props_details.icon = 'open-link-right-fill';
    context.props_details.link = '/awa_queue_list.do';
})(context, pageParams);
