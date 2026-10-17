(function(context) {
	var ciUtil = new sn_oe_sfs.CIUtil();
	var propsFromContext = ciUtil.getContentBlockContext(context.block_id);
	context.props_details.status = propsFromContext.status || 'start';
	
    if (context.props_details.status != 'skip') {
        var gr = new GlideRecord('sys_cs_topic');
        gr.addEncodedQuery('active=true^design_category=b1dfd7c254103300fa9b212481c502cb', true);
        gr.query();
        if (gr.next()) {
            context.props_details.status = 'complete';
			ciUtil.setContentBlockContext(context.block_id, { status: 'complete' });
        } else {
            context.props_details.status = 'start';
			ciUtil.setContentBlockContext(context.block_id, { status: 'start' });
        }
    }

    context.props_details.modalTitle = gs.getMessage('Activate a pre-built bot topic');
    context.props_details.averageEffort = gs.getMessage('Medium (1-2 hours)');
    context.props_details.documentationLabel = gs.getMessage('Getting started with Virtual Agent Designer');
    context.props_details.documentationLink = '';
    context.props_details.expertise = gs.getMessage('Virtual Agent Designer');
    context.props_details.modalButtonLabel = gs.getMessage('Go to VA Designer');
    context.props_details.modalButtonIcon = 'open-link-right-outline';
	  context.props_details.openInNewTab = true;
})(context);
