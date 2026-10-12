function transform(params){
	var pluginManager = new GlidePluginManager();
	if(pluginManager.isActive("com.sn.km.gen.ai")){
		return [];
	}
	
	var tables = new GlideTableHierarchy('kb_knowledge').getAllExtensions();
	var ga = new GlideAggregate('kb_assist_scan_result');
	ga.addQuery('state', 'open');
	ga.addAggregate('COUNT(DISTINCT', 'target_record');
	ga.addQuery('target_table', 'IN', tables);

	// one row per KB article
	ga.groupBy('target_record');
	ga.query();

	var kbSysIds = [];
	while (ga.next()) {
		kbSysIds.push(ga.getValue('target_record'));
	}

	var kbArticle = [];

	if (kbSysIds.length > 0) {
		var kbGr = new GlideRecordSecure('kb_knowledge');
		kbGr.addQuery('sys_id', 'IN', kbSysIds.join(','));
		kbGr.addQuery('author', gs.getUserID());
		kbGr.addEncodedQuery('workflow_stateNOT INretired,outdated', true);
		kbGr.query();

		while (kbGr.next()) {
			kbArticle.push({
			sys_id: kbGr.getUniqueValue(),
			label: kbGr.getValue('short_description'),
			number: kbGr.getValue('number')
		});
		}
	}
	return kbArticle;
}
