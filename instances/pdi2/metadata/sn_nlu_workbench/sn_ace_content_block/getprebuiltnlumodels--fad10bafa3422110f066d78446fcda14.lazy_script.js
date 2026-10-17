(function(context, pageParams, blockcontext){
	var allNLUModels = [];
	var modelDomain = blockcontext.modelDomain.reduce(function (domains, item) {
		return domains.concat(item.value);
		}, []).join(',') || '';
	var gr = new GlideRecord('sys_nlu_model');
	gr.addQuery('language', blockcontext.modelPrimaryLanguage);
	gr.addQuery('oob', true);
	gr.addQuery('category', blockcontext.currentTab);
	if(blockcontext.modelDomain){
		gr.addQuery('model_domain', modelDomain);
	}
	gr.query();
	while(gr.next()) {
		allNLUModels.push({"label": gr.getValue('display_name'), "id": gr.getValue('sys_id')});
	}
	gs.info(JSON.stringify(allNLUModels));
	return allNLUModels;
	//return JSON.parse(JSON.stringify(allNLUModels));
})(context, pageParams, blockcontext);
