(function process(g_request, g_response, g_processor) {

    var shouldNavigateToKnowledgeCenter = new KBCommon().shouldRedirectToKnowledgeCenter();
    var url;
    var articleId = g_request.getParameter('sysparm_article_id');
    var knowledgeBaseId = g_request.getParameter('sysparm_knowledge_base_id');

    // Redirect to Knowledge Center if enabled
    if (shouldNavigateToKnowledgeCenter) {
        if (knowledgeBaseId) {
            url = "now/knowledge-center/user-criteria-diagnostics/params/knowledgeBaseId/" + knowledgeBaseId;
        } else if (articleId) {
            url = "now/knowledge-center/user-criteria-diagnostics/params/articleId/" + articleId;
        } else {
            url = "now/knowledge-center/user-criteria-diagnostics";
        }

    } else {
        // Redirect to old User Criteria Diagnostics page in UI16
        if (knowledgeBaseId) {
            url = "km_diagnostics.do?sysparam_isarticle=false&sysparam_record=" + knowledgeBaseId;
        } else if (articleId) {
            url = "km_diagnostics.do?sysparam_isarticle=true&sysparam_record=" + articleId;
        } else {
            url = "km_diagnostics.do";
        }
    }
    g_response.sendRedirect(url);

})(g_request, g_response, g_processor);
