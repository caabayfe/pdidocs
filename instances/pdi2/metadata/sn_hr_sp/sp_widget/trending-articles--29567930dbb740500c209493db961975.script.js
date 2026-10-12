(function() {
  /* populate the 'data' object */
  /* e.g., data.table = $sp.getValue('table'); */
	var knowledgeBases = String($sp.getKnowledgeBases());
	var UserRecommendationUtil = new sn_hr_sp.UserRecommendationUtil();
	data.users = options.users || [];
	data.title = gs.getMessage("Knowledge Articles");
	var displayCount = 3;
	data.sysId = $sp.getParameter('sys_id') || options.ariaLabelId;
	if(GlidePluginManager.isActive('com.glide.platform_ml') && GlidePluginManager.isActive('com.sn_hr_core') && data.users && data.users.length > 0) {
		var results = UserRecommendationUtil.getArticlesforSimilarUsers(data.users,knowledgeBases,displayCount,options.recentActivityCutoffDate);
		if(results.length < displayCount) {
			var mostViewedArticleCount = displayCount - results.length;
			var articlesToIgnore = [];
		  for (var i=0;i<results.length;i++) {
				articlesToIgnore.push(results[i].sys_id);
			}
			var mostViewedArticles = getMostViewedArticles(mostViewedArticleCount,articlesToIgnore); 
			results = results.concat(mostViewedArticles);
		}
		data.response = results;
	}
	else
		data.response = getMostViewedArticles(displayCount);
	
  function getMostViewedArticles(articleCount,ignoreArticles) {
    var articlesPayload = {
      knowledgeBases: knowledgeBases,
      kbRecords : $sp.getAllKBRecords(knowledgeBases),
      articleCount: articleCount,
      ignoreArticles: ignoreArticles
    };
    var mostViewedArticles = UserRecommendationUtil.getMostViewedArticles(articlesPayload);
    return mostViewedArticles;
  }
	
})();
