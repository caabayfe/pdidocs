(function(context) {
    context.props_details.modalTitle = gs.getMessage("Create your bot's greeting");
    context.props_details.averageEffort = gs.getMessage('Low (less than 1 hour)');
    context.props_details.documentationLabel = gs.getMessage('Change the Virtual Agent greeting messages in the Greeting setup topic');
    context.props_details.documentationLink = 'https://docs.servicenow.com/bundle/sandiego-servicenow-platform/page/administer/virtual-agent/task/va-welcome-topic-selection-msgs.html';
    context.props_details.expertise = gs.getMessage('Virtual Agent');
    context.props_details.modalButtonLabel = gs.getMessage('Set up greeting');
    context.props_details.openInNewTab = false;
    context.props_details.endpoint = null;
    context.props_details.ciEndpointDetails = {
        'route': 'list',
        'fields': {
            'table': 'sys_cs_context_profile'
        },
        'params': {
            'view': 'simple_chat_context_profiles',
            'tour': 'active',
            'aceNav': 'virtual-agent'
        }
    };

    var propsFromContext = new sn_oe_sfs.CIUtil().getContentBlockContext(context.block_id);
    context.props_details.status = propsFromContext.status || 'start';
})(context);
