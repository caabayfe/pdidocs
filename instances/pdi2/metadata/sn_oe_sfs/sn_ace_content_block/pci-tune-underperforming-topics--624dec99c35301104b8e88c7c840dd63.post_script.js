(function(context) {
    var endpoint = '/now/conversation/settings/overview/params/start-date/{startDate}/end-date/{endDate}';
    var startDate = new GlideDateTime(gs.daysAgo(30)).getDate().toString();
    var endDate = new GlideDateTime().getDate().toString();
    endpoint = endpoint.replace('{startDate}', startDate).replace('{endDate}', endDate);
    context.props_details.endpoint = endpoint;
    context.props_details.modalTitle = gs.getMessage('Fix underperforming topics');
    context.props_details.averageEffort = gs.getMessage('Medium (1-2 hours)');
    context.props_details.documentationLabel = gs.getMessage('Conversational Analytics Dashboard');
    context.props_details.documentationLink = 'https://www.servicenow.com/docs/bundle/zurich-conversational-interfaces/page/administer/virtual-agent/concept/VA-dashboard-landing-page-pae.html';
    context.props_details.expertise = gs.getMessage('Virtual Agent (VA) Analytics');
    context.props_details.modalButtonLabel = gs.getMessage('Go to VA Analytics');
    context.props_details.modalButtonIcon = 'open-link-right-outline';
    context.props_details.openInNewTab = true;

    var propsFromContext = new sn_oe_sfs.CIUtil().getContentBlockContext(context.block_id);
    context.props_details.status = propsFromContext.status || 'start';
})(context);
