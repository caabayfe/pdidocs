var COMMUNITY = gs.getProperty('sn_communities.knowledge_base_id');
answer = execute();

function execute() {
    if (current.question.kb_knowledge_base.toString() != COMMUNITY) {
        return new SocialQACommon().canRead(current.question.kb_knowledge_base);
    }
	else if(current.question.kb_knowledge_base.toString() == COMMUNITY){
		return new sn_communities.CommunityContent().canReadContent(current.content);
	}
	return false;
}
