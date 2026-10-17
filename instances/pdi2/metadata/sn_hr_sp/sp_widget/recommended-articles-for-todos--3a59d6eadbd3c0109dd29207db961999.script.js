(function() {
  /* populate the 'data' object */
  /* e.g., data.table = $sp.getValue('table'); */
		data.sys_id = options.task_id;
	  data.service = options.service;
	  var solution= '';
    var knowledge_bases = String($sp.getKnowledgeBases());
	  var displayCount =2;
	  if(options.table == "sn_hr_core_task")
			solution = options.solution_name_for_hr_task;
	  else if (options.table == "sn_cd_task" || options.table == "sn_ca_campaign_item")
			solution = options.solution_name_for_content_task
	
	  var ML_Utils = new sn_hr_sp.HR_MLPortalUtils();
	  data.results = ML_Utils.getRecommendedArticles(data.sys_id,options.table,knowledge_bases,solution,displayCount);
	  if(data.results && data.results.length ==1) 
			data.title = gs.getMessage("Related article");
	  else 
			data.title = gs.getMessage("Related articles");
	   
})();
