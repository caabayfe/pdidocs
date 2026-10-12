(function(){
      var utils = new sn_km_center.ArticleAssistUtils(); 
      utils.runScan("585113caffd876104ade90e0653bf1f6");
	  if (!GlidePluginManager.isActive('com.sn.km.gen.ai')) {
			return;
		}
      try{
		if(!new sn_km_center.HealthScoreUtils().isHealthScoreEligible()){
			return;
		}
		gs.info('SN_KM_CENTER: Article Optimization - Scripted: KBArticleHealthScoreUtil().calculateForAllKnowledgeBases() started.');
		new sn_km_center.KBArticleHealthScoreUtil().calculateForAllKnowledgeBases();
		gs.info('SN_KM_CENTER: Article Optimization - Scripted: KBArticleHealthScoreUtil().calculateForAllKnowledgeBases() completed.');
		gs.eventQueue("sn_km_center.article_score.calculated");
      }catch(err){
      	gs.error('SN_KM_CENTER: Article Optimization - Scripted : error : ' + JSON.stringify(err));
      }
      })();
