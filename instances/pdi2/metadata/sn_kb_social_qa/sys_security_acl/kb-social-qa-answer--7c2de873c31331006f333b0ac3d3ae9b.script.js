var COMMUNITY = gs.getProperty('sn_communities.knowledge_base_id');
answer = execute();

function execute() {
	if (current.question.kb_knowledge_base.toString() != COMMUNITY) {
		var commonUtil = new SocialQACommon();
		return (commonUtil.canEditAnswer(current) || commonUtil.isQuestionPoster(current.question.profile));
	}
	return false;
}
