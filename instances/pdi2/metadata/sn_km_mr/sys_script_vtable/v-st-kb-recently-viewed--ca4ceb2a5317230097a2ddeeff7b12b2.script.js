(function executeQuery(v_table, v_query) {
	var kbUtil = new global.KBKnowledge();
	var articleArr = kbUtil.getRecentlyViewedArticles();
	if(articleArr && articleArr.length){
		articleArr.forEach(function(article){
			v_table.addRow(article);
		});
	}
})(v_table, v_query);
