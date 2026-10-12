var COMMUNITY = gs.getProperty('sn_communities.knowledge_base_id');
answer = execute();

function execute() {
    if (current.question.kb_knowledge_base.toString() != COMMUNITY) {
        var commonUtil = new SocialQACommon();
        var user = gs.getUserID();
        var profile = new global.GlobalKnowledgeUtil().getSessionProfile();
        var kbManager = commonUtil.isKnowledgeManager(current.question.kb_knowledge_base, user);
        if (kbManager)
            return true;
        else {
            var canWrite = commonUtil.canWrite(current.question.kb_knowledge_base);
            if ((current.question.profile == profile))
                return true;
        }
        return false;
    }
	return false;
}
