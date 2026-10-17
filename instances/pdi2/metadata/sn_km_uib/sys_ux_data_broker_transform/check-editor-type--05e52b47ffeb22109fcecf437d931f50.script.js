function transform(input) {
	if(gs.nil(input) || gs.nil(input.articleId) || gs.nil(input.tableName)) {
		return {
			showNotification: false,
			shouldRedirect: false,
		};
	}
    const isFeatureEnabled = (new global.KBKnowledge()).isEnhancedEditorEnabled();
    const record = new GlideRecordSecure(input.tableName);
    record.get(input.articleId);
	const isEnhancedArticle = record.getValue('editor_type') === 'ECE';

	return {
		showNotification: isEnhancedArticle,
		shouldRedirect: isFeatureEnabled
	};
}
