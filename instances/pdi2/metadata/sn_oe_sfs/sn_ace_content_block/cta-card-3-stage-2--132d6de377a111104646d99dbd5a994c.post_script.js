(function(context, pageParams) {
    context.props_details.title = sn_i18n.Message.getMessage('sn_oe_sfs','Third');
    context.props_details.key = 'SETUP_ASSIGNMENT_RULES';
    context.props_details.subtitle = sn_i18n.Message.getMessage('sn_oe_sfs','Add assignment rules');
    context.props_details.label = sn_i18n.Message.getMessage('sn_oe_sfs','Set up assignment rules');
    context.props_details.image = '/images/awa-add-assignment-rules.png';
    context.props_details.desc = sn_i18n.Message.getMessage('sn_oe_sfs','Define exactly how work items are automatically assigned to agents.');
    context.props_details.icon = 'open-link-right-fill';
    context.props_details.link = '/awa_assignment_rule_list.do';

})(context, pageParams);
