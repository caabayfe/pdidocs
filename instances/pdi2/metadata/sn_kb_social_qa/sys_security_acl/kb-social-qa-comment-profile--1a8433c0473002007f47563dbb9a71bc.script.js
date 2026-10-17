answer = execute();

function execute() {
    if (gs.nil(current.content)) {
        var commonUtil = new SocialQACommon();
        var user = gs.getUserID();
        var grRef = new GlideRecord(current.reference_name);
        if (grRef.isValid() && grRef.get(current.reference_id)) {
            var kbManager = false;
            if (grRef.getTableName() == 'kb_social_qa_question')
                kbManager = this.isKnowledgeManager(grRef.kb_knowledge_base, user);
            else
                kbManager = this.isKnowledgeManager(grRef.question.kb_knowledge_base, user);
            if (kbManager)
                return true;
            return false;
        }
    }
	return false;
}
