(function process(g_request, g_response, g_processor) {
    var shouldNavigateToKnowledgeCenter = new KBCommon().shouldRedirectToKnowledgeCenter();

    if (shouldNavigateToKnowledgeCenter) {
        var sysId = g_request.getParameter("sys_id");
        var newDestination = "now/knowledge-center/record/kb_knowledge/" + sysId;
        g_response.sendRedirect(newDestination);
    } else {
        var originalQuery = g_request.getQueryString();
        var page = "kb_knowledge.do?";
        g_response.sendRedirect(page + originalQuery);
    }

})(g_request, g_response, g_processor);
