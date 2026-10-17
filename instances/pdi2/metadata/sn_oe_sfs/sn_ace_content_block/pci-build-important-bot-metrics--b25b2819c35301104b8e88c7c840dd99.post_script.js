(function(context) {
    context.props_details.modalTitle = gs.getMessage('Get to know the important bot metrics');
    context.props_details.averageEffort = gs.getMessage('Low (less than 1 hour)');
    context.props_details.documentationLabel = gs.getMessage('Conversational Analytics Dashboard');
    context.props_details.documentationLink = 'https://www.servicenow.com/docs/bundle/zurich-conversational-interfaces/page/administer/virtual-agent/concept/VA-dashboard-landing-page-pae.html';
    context.props_details.expertise = gs.getMessage('Virtual Agent Analytics');
    context.props_details.modalButtonLabel = gs.getMessage('Go to VA Analytics');
    context.props_details.modalButtonIcon = 'open-link-right-outline';
	  context.props_details.openInNewTab = true;

    var propsFromContext = new sn_oe_sfs.CIUtil().getContentBlockContext(context.block_id);
    context.props_details.status = propsFromContext.status || 'start';
})(context);
