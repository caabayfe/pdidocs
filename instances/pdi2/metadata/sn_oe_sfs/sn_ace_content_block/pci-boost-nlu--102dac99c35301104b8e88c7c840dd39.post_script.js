(function(context) {
    context.props_details.modalTitle = gs.getMessage("Configure your bot's Natural Language Understanding (NLU)");
    context.props_details.averageEffort = gs.getMessage('High (4-6 hours)');
    context.props_details.documentationLabel = gs.getMessage('Implement NLU in Virtual Agent');
    context.props_details.documentationLink = 'https://docs.servicenow.com/bundle/sandiego-servicenow-platform/page/administer/virtual-agent/task/implement-nlu-va.html';
    context.props_details.expertise = gs.getMessage('Natural language understanding (NLU)');
    context.props_details.modalButtonLabel = gs.getMessage('Set up NLU');
    context.props_details.modalButtonIcon = 'open-link-right-outline';
	  context.props_details.openInNewTab = true;
	
    var propsFromContext = new sn_oe_sfs.CIUtil().getContentBlockContext(context.block_id);
    context.props_details.status = propsFromContext.status || 'start';
})(context);
