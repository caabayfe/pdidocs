(function(context) {
    context.props_details.modalTitle = gs.getMessage('Install pre-built bot topic bundle');
    context.props_details.showAverageEffort = false;
    context.props_details.documentationLabel = gs.getMessage('Pre-built Virtual Agent topic blocks and ServiceNow NLU models');
    context.props_details.documentationLink = 'https://docs.servicenow.com/bundle/sandiego-servicenow-platform/page/administer/virtual-agent/task/train-test-publish-nlu-model-vad.html';
    context.props_details.expertise = gs.getMessage('Virtual Agent Designer');
    context.props_details.modalButtonLabel = gs.getMessage('Install');

    var propsFromContext = new sn_oe_sfs.CIUtil().getContentBlockContext(context.block_id);
    context.props_details.status = propsFromContext.status || 'start';
})(context);
