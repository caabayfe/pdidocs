(function process( /*ResolverEnvironment*/ env) {

    var maxRecords = env.getArguments().maxRecords != null ? env.getArguments().maxRecords : 5;
    var displayField = env.getArguments().displayField;
    var secondaryFields = env.getArguments().secondaryFields != null && env.getArguments().secondaryFields.length > 0 ? env.getArguments().secondaryFields.split(",") : [];
    var knowledgeBase = env.getArguments().knowledgeBase;
    var articleId = env.getArguments().articleId;
    var sourceId = env.getArguments().sourceId;
    var sourceTable = env.getArguments().sourceTable;
    var sourceColumn = env.getArguments().sourceColumn;
    var targetColumn = env.getArguments().targetColumn;

    var kbPortal = new global.KBPortalServiceImpl();

    var result = kbPortal.getRelatedArticles(maxRecords, displayField, secondaryFields, knowledgeBase,
        articleId, sourceId, sourceTable, sourceColumn, targetColumn, "kb_article_view");

    return result == null ? [] : result;

})(env);
