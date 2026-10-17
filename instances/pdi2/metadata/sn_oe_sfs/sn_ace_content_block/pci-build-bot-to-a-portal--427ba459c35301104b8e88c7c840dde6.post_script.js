(function(context) {
	var ciUtil = new sn_oe_sfs.CIUtil();
    var propsInContext = ciUtil.getContentBlockContext(context.block_id);
	
	context.props_details.status = propsInContext.status || 'start';
	
    if (context.props_details.status != 'skip') {
        var gr = new GlideRecord('sp_agent_chat_config');
        gr.addActiveQuery();
        gr.query();
        if (gr.next()) {
            context.props_details.status = 'complete';
			ciUtil.setContentBlockContext(context.block_id, { status: 'complete' });
        } else {
            context.props_details.status = 'start';
			ciUtil.setContentBlockContext(context.block_id, { status: 'start' });
        }
    }
	
    context.props_details.modalTitle = gs.getMessage('Add your bot to a portal');
    context.props_details.averageEffort = gs.getMessage('Low (less than 1 hour)');
    context.props_details.documentationLabel = gs.getMessage('Add your bot to a portal');
    context.props_details.documentationLink = 'https://docs.servicenow.com/bundle/sandiego-servicenow-platform/page/administer/conversational-interfaces/task/ac-configure-bot-portal.html';
    context.props_details.expertise = gs.getMessage('Virtual Agent');
    context.props_details.modalButtonLabel = gs.getMessage('Set up portal');
})(context);
