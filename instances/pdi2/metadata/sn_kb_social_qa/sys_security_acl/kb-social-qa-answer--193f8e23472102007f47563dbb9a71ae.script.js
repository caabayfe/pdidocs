var COMMUNITY = gs.getProperty('sn_communities.knowledge_base_id');
answer = execute();

function execute() {
    if (current.question.kb_knowledge_base.toString() != COMMUNITY) {
        var commonUtil = new SocialQACommon();
        var user = gs.getUserID();
        var kbManager = commonUtil.isKnowledgeManager(current.question.kb_knowledge_base, user);
        if (kbManager)
            return true;
        return false;
        //Hard delete is not allowed to user, but in future might open
    }
	return false;
}
