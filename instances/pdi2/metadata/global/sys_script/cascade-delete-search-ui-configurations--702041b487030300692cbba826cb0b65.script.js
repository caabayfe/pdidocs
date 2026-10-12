(function executeRule(current, previous /*null when async*/) {

	var grActConf = new GlideRecord('cxs_ui_action_config');
	grActConf.addQuery('search_ui_config', current.sys_id);
	grActConf.query();
	if(grActConf.hasNext()){
		//delete config recs if search context changed, new context recs created below
		grActConf.deleteMultiple();
	}

})(current, previous);
