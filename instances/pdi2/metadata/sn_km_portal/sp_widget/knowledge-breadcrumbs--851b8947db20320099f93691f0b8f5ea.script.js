(function() {
	data.sysparm_kb_search_table = $sp.getParameter('sysparm_kb_search_table');
	data.page_id = $sp.getParameter('id');
	
	data.showSearchBox = (options.show_search_box && options.show_search_box == "true") || false;
	var portalRecord = $sp.getPortalRecord();
	var portal = portalRecord.getUniqueValue();
	if ($sp.isAISearchEnabled())
		data.search_options = options;
	else
		data.search_options = options.search_options || {};
	data.showKbHomeLink = (portal != '45d6680fdb52220099f93691f0b8f5ad');

	var sysId = $sp.getParameter('sys_kb_id');
	var number = $sp.getParameter('sysparm_article');
	var kbViewModel = new global.KBViewModel();
	data.short_description = "";
	if (sysId) {
		kbViewModel.findKnowledgeById(sysId);
	} else if (number) {
		kbViewModel.findKnowledgeByNumber(number);
	}
	if(kbViewModel && kbViewModel.knowledgeRecord && kbViewModel.knowledgeRecord.short_description) {
		data.short_description = kbViewModel.knowledgeRecord.short_description.getDisplayValue();
	}
})();
