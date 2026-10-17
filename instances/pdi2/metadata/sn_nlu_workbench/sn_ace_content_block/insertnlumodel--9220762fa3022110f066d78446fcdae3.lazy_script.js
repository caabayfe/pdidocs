(function(context, pageParams, blockcontext){
	var model = new GlideRecordSecure('sys_nlu_model');
	var modelDomain = blockcontext.modelDomain.reduce(function (domains, item) {
		return domains.concat(item.value);
	}, []).join(',') || '';
	model.display_name = blockcontext.modelName;
	model.confidence_threshold = Number(blockcontext.confidenceThreshold)/100;
	model.description = blockcontext.modelShortDescription;
	model.language = blockcontext.modelPrimaryLanguage;
	model.category = blockcontext.currentTab;
	model.model_domain = modelDomain;
	var modelSysId = model.insert();
	return '/$nlu-studio.do#/model-overview/' + modelSysId;
})(context, pageParams, blockcontext);
