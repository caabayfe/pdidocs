function($http,$rootScope, $filter,$timeout,spAriaUtil) {
    var c = this;
	c.options.title = c.options.title || "${Explore our Knowledge Bases}";
	c.options.post_question_label = c.options.post_question_label || "${Ask a Question}";
	c.options.create_article_label = c.options.create_article_label || "${Create Article}";
	c.isFirefox = false;
	c.showMoreLink = true;
	c.subscribedText = "${Subscribed}";
	c.unSubscribeText = "${Unsubscribe}";
	c.kbPortalSysID = "45d6680fdb52220099f93691f0b8f5ad";

	if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
		c.isFirefox = true;
	}
	$rootScope.kb_count = c.data.total_kb_count;
	$rootScope.articles_count = c.data.total_articles_count;
	if (c.data.sqaUiActive)
		$rootScope.socialqa_count = c.data.total_socialqa_count;
	$rootScope.isMobile = c.data.isMobile;

	c.getOrderedItems = function() {
		return $filter('orderBy')(c.data.result, c.options.order_by, c.options.order_reverse);
	}
	c.focusFirstElement= function(e){
		$timeout(function(){$('div.kb-action-btns').children('ul').children('li:first-child').children('a').focus();})
	}
	
	c.getKBLink = function(item) {
		if (c.options.aisEnabled && c.data.portal_sys_id == c.kbPortalSysID) {
			var facetFilters = JSON.stringify(['_kb_knowledge.kb_knowledge_base_s:FACET(\"' + item.title + '\")']);
			return '?id=search&spa=1&q=***&disableAllSuggestions=false&facetFilters=' + facetFilters;
		}
		return '?id=kb_search&kb_knowledge_base=' + item.sys_id;
    }
};
