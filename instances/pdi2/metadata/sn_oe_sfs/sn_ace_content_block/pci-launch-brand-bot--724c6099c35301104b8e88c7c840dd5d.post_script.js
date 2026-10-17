(function(context) {
    context.props_details.modalTitle = gs.getMessage('Brand your bot');
    context.props_details.averageEffort = gs.getMessage('Low (1-2 hours)');
    context.props_details.documentationLabel = gs.getMessage('Live and Virtual Agent chat feature configuration');
    context.props_details.documentationLink = 'https://docs.servicenow.com/bundle/sandiego-customer-service-management/page/product/customer-service-management/reference/agent-chat-feature-configuration-fields.html';
    context.props_details.expertise = gs.getMessage('Virtual Agent');
    context.props_details.modalButtonLabel = gs.getMessage('Set up branding');

    var propsFromContext = new sn_oe_sfs.CIUtil().getContentBlockContext(context.block_id);
    context.props_details.status = propsFromContext.status || 'start';
    context.props_details.openInNewTab = false;
    context.props_details.endpoint = null;
    context.props_details.ciEndpointDetails = {
        'route': 'list',
        'fields': {
            'table': 'sys_cs_branding_setup'
        },
        'params': {
            'tour': 'active',
            'aceNav': 'general'
        }
    };
})(context);
