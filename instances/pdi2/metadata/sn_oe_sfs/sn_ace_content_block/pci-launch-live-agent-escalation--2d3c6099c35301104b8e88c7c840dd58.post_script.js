(function(context) {
    context.props_details.modalTitle = gs.getMessage('Set up live agent escalation');
    context.props_details.averageEffort = gs.getMessage('High (4-6 hours)');
    context.props_details.documentationLabel = gs.getMessage('Set up Agent Chat');
    context.props_details.documentationLink = 'https://docs.servicenow.com/bundle/sandiego-servicenow-platform/page/administer/conversational-interfaces/task/ac-configure-agent-chat.html';
    context.props_details.expertise = gs.getMessage('Agent Chat, Virtual Agent');
    context.props_details.modalButtonLabel = gs.getMessage('Set up Agent Chat');

    var propsFromContext = new sn_oe_sfs.CIUtil().getContentBlockContext(context.block_id);
    context.props_details.status = propsFromContext.status || 'start';
    context.props_details.openInNewTab = false;
    context.props_details.endpoint = null;
    context.props_details.ciEndpointDetails = {
        'route': 'agent-chat',
        'fields': {},
        'params': {
            'aceNav': 'agent-chat'
        }
    };
})(context);
