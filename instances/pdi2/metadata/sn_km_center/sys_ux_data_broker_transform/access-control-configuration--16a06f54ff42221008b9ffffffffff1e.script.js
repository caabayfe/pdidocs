function transform(input) {
	var userCanCreateArticle = new global.KBKnowledge().canCreate();
	var userCanCreateBlock = false;
	if (GlidePluginManager.isActive('com.snc.knowledge_blocks')) {
		userCanCreateBlock = userCanCreateArticle && new global.KBBlock().isKBBlockEnabled();
	}
	return {
		canCreateArticle: userCanCreateArticle,
		canCreateBlock: userCanCreateBlock
	};
}
