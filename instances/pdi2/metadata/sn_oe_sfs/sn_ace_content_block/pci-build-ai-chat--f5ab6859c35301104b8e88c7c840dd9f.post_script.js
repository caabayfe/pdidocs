(function(context) {
	var ciUtil = new sn_oe_sfs.CIUtil();
    var propsInContext = ciUtil.getContentBlockContext(context.block_id);
	
	context.props_details.status = propsInContext.status || 'start';
	
    if (context.props_details.status != 'skip') {
        if (ciUtil.isAiSearchInitialized() || ciUtil.isAiSearchServiceConfigured() || ciUtil.isAiSearchEnabled()) {
            context.props_details.status = 'complete';
			ciUtil.setContentBlockContext(context.block_id, { status: 'complete' });
        } else {
            context.props_details.status = 'start';
			ciUtil.setContentBlockContext(context.block_id, { status: 'start' });
        }
    }

    context.props_details.modalTitle = gs.getMessage('Request AI powered search');
    context.props_details.averageEffort = gs.getMessage('Low (less than 1 hour)');
    context.props_details.documentationLabel = gs.getMessage('Configuring AI Search');
    context.props_details.documentationLink = 'https://docs.servicenow.com/bundle/sandiego-platform-administration/page/administer/ai-search/concept/configuring-ais.html';
    context.props_details.expertise = gs.getMessage('AI Search');
    context.props_details.modalButtonLabel = gs.getMessage('Request AI Search');
	  context.props_details.modalButtonIcon = 'open-link-right-outline';
	  context.props_details.openInNewTab = true;
})(context);
