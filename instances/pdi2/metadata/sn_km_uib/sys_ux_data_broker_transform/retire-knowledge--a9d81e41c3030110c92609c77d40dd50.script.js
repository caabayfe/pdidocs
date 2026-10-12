function transform(input) {
    var retireKnowledge = function(articleId) {
        var kbKnowledge = new global.KBKnowledge();
        kbKnowledge.retireKnowledgeById(articleId);
    };

    var retireKnowledgeWithReplacement = function(baseArticleId, replacementArticleId) {
        var kbKnowledge = new global.KBKnowledge();
        kbKnowledge.retireKnowledgeWithReplacementByIds(baseArticleId, replacementArticleId);
    };

    gs.nil(input.replacementArticleId) ? retireKnowledge(input.baseArticleId) : retireKnowledgeWithReplacement(input.baseArticleId, input.replacementArticleId);
}
