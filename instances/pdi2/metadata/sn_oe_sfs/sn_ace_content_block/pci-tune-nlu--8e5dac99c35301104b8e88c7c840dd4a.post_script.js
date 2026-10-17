(function(context) {
    context.props_details.modalTitle = gs.getMessage('Review natural language understanding (NLU) settings');
    context.props_details.averageEffort = gs.getMessage('Low (1-2 hours)');
    context.props_details.documentationLabel = gs.getMessage('Implement NLU in Virtual Agent');
    context.props_details.documentationLink = 'https://docs.servicenow.com/bundle/sandiego-servicenow-platform/page/administer/virtual-agent/task/implement-nlu-va.html';
    context.props_details.expertise = gs.getMessage('Virtual Agent');
    context.props_details.modalButtonLabel = gs.getMessage('Go to NLU settings');
    context.props_details.openInNewTab = false;
    context.props_details.endpoint = null;
    context.props_details.ciEndpointDetails = {
        'route': 'nlu-setting',
        'fields': {},
        'params': {
            'aceNav': 'virtual-agent'
        }
    };

    var propsFromContext = new sn_oe_sfs.CIUtil().getContentBlockContext(context.block_id);
    context.props_details.status = propsFromContext.status || 'start';

})(context);
