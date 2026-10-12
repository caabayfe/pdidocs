(function() {
    data.quickLinkHeader = gs.getMessage(options.title);
    data.headingLevel = options.title_heading_level || 'h3';
    data.instanceId = $sp.getDisplayValue("sys_id");
    data.isMobileApp = $sp.getParameter('view') === 'mobile';
    data.portal = $sp.getPortalRecord();

    var topicId = $sp.getParameter('topic_id');
    if (topicId) {
        data.json_data = new sn_ex_sp.QuickLinkUtil().fetchQuicklinksForTopic(topicId);
    }
    if (input && input.action == 'openGuidedhelp' && input.guidedHelpId) {
        data.pageId = $sp.getParameter('id') ? $sp.getParameter('id') : data.portal.homepage.getDisplayValue();
        data.guidedHelpResponse = new sn_ex_sp.QuickLinkUtil().handleGuidedHelpClick(input.guidedHelpId, data.pageId, "quick_link");
    }
})();
