(function executeRule(current, previous /*null when async*/) {
	var changeModelGr = new GlideRecord("chg_model");

	var modelSysId;
	if (current.getValue("unauthorized") === "1")
		modelSysId ='aedc6a625323101034d1ddeeff7b1296'; //Unauthorised Model
	else
		modelSysId = ChangeModelChgReqAPISNC.getModelOrDefault("emergency");

	if (changeModelGr.get(modelSysId)) {
		var changeModel = new ChangeModel(changeModelGr);
		changeModel.applyModel(current);
	}
})(current, previous);
