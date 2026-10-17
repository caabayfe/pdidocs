(function(context) {
    context.props_details.modalTitle = gs.getMessage('Automate issue follow-up and resolution');
    context.props_details.averageEffort = gs.getMessage('Medium (1-2 hours)');
    context.props_details.documentationLabel = gs.getMessage('Setting up Issue Auto Resolution for Virtual Agent');
    context.props_details.documentationLink = 'https://www.servicenow.com/docs/bundle/zurich-conversational-interfaces/page/administer/virtual-agent/concept/dashboard-auto-resolution-pae.html';
    context.props_details.expertise = gs.getMessage('Issue Auto Resolution (IAR)');
    context.props_details.modalButtonLabel = gs.getMessage('Set up IAR');
    context.props_details.modalButtonIcon = 'open-link-right-outline';
    context.props_details.openInNewTab = true;
	
    var propsFromContext = new sn_oe_sfs.CIUtil().getContentBlockContext(context.block_id);
    context.props_details.status = propsFromContext.status || 'start';
})(context);
