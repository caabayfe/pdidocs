var COMMUNITY = gs.getProperty('sn_communities.knowledge_base_id');
answer = execute();

function execute() {
    var knowledgeBase = '' + (gs.nil(current.kb_knowledge_base) ? gs.getProperty('glide.service_portal.sqanda.default_kb') : current.kb_knowledge_base);
    if (!gs.nil(knowledgeBase) && knowledgeBase != COMMUNITY) {
        return new SocialQACommon().canCreate(knowledgeBase);
    }

    return false;
}
