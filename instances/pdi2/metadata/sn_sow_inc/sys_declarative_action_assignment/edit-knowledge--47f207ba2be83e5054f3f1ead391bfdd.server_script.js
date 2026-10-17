var targetURL;
try {
    targetURL = new SOWIncidentKnowledgeUtils().getEditKnowledgeArticleLink(current);
} catch (error) {
    targetURL = 'kb_knowledge.do?sys_id=-1&sysparm_referring_url=kb_view.do';
    gs.error("Error occurred while fetching targetURL: " + error);
}
action.setReturnURL(current);
action.setRedirectURL(targetURL);
