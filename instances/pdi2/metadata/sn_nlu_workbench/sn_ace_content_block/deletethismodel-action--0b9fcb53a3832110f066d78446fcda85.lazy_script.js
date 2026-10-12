
(function(context, pageParams, blockcontext){
	var modelId = blockcontext.modelToDeleteSysId;
	global.NLUModel.deleteModel(modelId);
})(context, pageParams, blockcontext);
