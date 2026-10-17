function transform(input) {
    if (input.articleId) {
        var kbViewModel = new global.KBViewModel();
        kbViewModel.findKnowledgeById(input.articleId);

        var isValidRecord = kbViewModel.isValid;

        if (!isValidRecord) {
            return {
                isValid: false
            };
        }

        var replacementArticleId = kbViewModel.knowledgeRecord.getUniqueValue();
        var replacementArticleClass = kbViewModel.knowledgeRecord.getValue('sys_class_name');

        while (isValidRecord && kbViewModel.hasReplacementAvailable()) {
            replacementArticleId = kbViewModel.knowledgeRecord.getValue('replacement_article');
            var latestReplacementArticle = kbViewModel.getLatestAccessibleVersionFromId(replacementArticleId);
            var isLatest = (!gs.nil(latestReplacementArticle) && (latestReplacementArticle.getValue('version') != kbViewModel.knowledgeRecord.getValue('version')));
            replacementArticleId = isLatest ? latestReplacementArticle.getValue('sys_id') : replacementArticleId;
            kbViewModel = new global.KBViewModel();
            kbViewModel.findKnowledgeById(replacementArticleId);
            isValidRecord = kbViewModel.isValid;
            replacementArticleClass = kbViewModel.knowledgeRecord.getValue('sys_class_name');
        }

        return {
            "sysId": replacementArticleId,
            "class": replacementArticleClass,
            isValid: isValidRecord
        };
    }

    return null;
}
