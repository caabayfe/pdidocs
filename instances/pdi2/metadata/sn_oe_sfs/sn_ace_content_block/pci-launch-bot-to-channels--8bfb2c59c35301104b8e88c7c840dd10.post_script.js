(function(context) {
    context.props_details.modalTitle = gs.getMessage('Add your bot to channels like Slack, Teams, and Workplace');
    context.props_details.averageEffort = gs.getMessage('Low (less than 1 hour)');
    context.props_details.documentationLabel = gs.getMessage('Virtual Agent integration with messaging apps');
    context.props_details.documentationLink = 'https://docs.servicenow.com/bundle/sandiego-servicenow-platform/page/administer/virtual-agent/concept/va-integration-messaging-apps.html';
    context.props_details.expertise = gs.getMessage('Virtual Agent');
    context.props_details.modalButtonLabel = gs.getMessage('Set up bot channels');
    context.props_details.modalButtonIcon = 'open-link-right-outline';
    context.props_details.openInNewTab = true;

    var propsFromContext = new sn_oe_sfs.CIUtil().getContentBlockContext(context.block_id);
    context.props_details.status = propsFromContext.status || 'start';
})(context);
