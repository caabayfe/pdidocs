function publish(input){
	if(gs.nil(input) || gs.nil(input.articleId) || gs.nil(input.articleTable))
		return false;
	return new global.KnowledgeUIAction().publishArticleById(input.articleTable,input.articleId);
}
