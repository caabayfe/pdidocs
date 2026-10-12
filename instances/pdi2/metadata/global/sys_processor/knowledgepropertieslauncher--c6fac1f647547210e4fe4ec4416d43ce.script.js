(function process(g_request, g_response, g_processor) {

    var shouldNavigateToKnowledgeCenter = new KBCommon().shouldRedirectToKnowledgeCenter();
    var url;
    // Redirect to Knowledge Center if enabled
    if (shouldNavigateToKnowledgeCenter) {
        url = "now/knowledge-center/properties";
    } else {
        // Redirect to old system properties UI
        url = "system_properties_ui.do?sysparm_title=Knowledge%20Management%20Properties&sysparm_category=Knowledge%20Portal%20Properties,Knowledge%20View%20Properties,Knowledge%20Search%20Properties,Knowledge%20Homepage%20Properties,Knowledge%20Other%20Properties,Article%20Versioning%20Properties,KM%20Subscription%20Properties,Article%20Quality%20Index%20Properties,Knowledge%20External%20Integration%20Propertie,Actionable%20Feedback%20Properties,Group%20Ownership%20Properties,Knowledge%20Center%20Properties";
    }
    g_response.sendRedirect(url);


})(g_request, g_response, g_processor);
