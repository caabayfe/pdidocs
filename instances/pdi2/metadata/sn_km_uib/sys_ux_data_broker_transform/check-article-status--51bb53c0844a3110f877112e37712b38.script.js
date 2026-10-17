function transform(input) {
    var isHidden = true;

    if (input.tableName == "kb_knowledge" || input.tableName.startsWith("kb_template") || input.tableName.startsWith("u_kb_template")) {
    	if (GlidePluginManager.isActive("sn_km_gen_ai")) {
            isHidden = false;

            var articleModified = new global.GlobalKnowledgeUtilSNC().isArticleModified(input.articleId);
            if (articleModified == "-1" || articleModified == "true")
                isHidden = true;
        }
    }
    return {
        hidden: isHidden
    };


}
