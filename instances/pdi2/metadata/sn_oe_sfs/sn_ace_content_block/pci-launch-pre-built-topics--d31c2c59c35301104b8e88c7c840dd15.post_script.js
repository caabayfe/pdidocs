(function(context) {
    context.props_details.modalTitle = gs.getMessage('Get pre-built bot topics based upon your support history');
    context.props_details.averageEffort = gs.getMessage('Medium (1-2 hours)');
    context.props_details.documentationLabel = gs.getMessage('Run a Topic Recommendation analysis');
    context.props_details.documentationLink = 'https://docs.servicenow.com/bundle/sandiego-servicenow-platform/page/administer/virtual-agent/task/run-tr-analysis.html';
    context.props_details.expertise = gs.getMessage('Topic Recommendations (TR)');
    context.props_details.modalButtonLabel = gs.getMessage('Get pre-built topics');
    context.props_details.modalButtonIcon = 'open-link-right-outline';
	  context.props_details.openInNewTab = true;
	
    var propsFromContext = new sn_oe_sfs.CIUtil().getContentBlockContext(context.block_id);
    context.props_details.status = propsFromContext.status || 'start';
})(context);
