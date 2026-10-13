var params = new JSON().decode(event.parm1);
if(new PIWBAutoTrainUtil().isInstanceEligibleForAutoTrain())
	new PIWBPredictabilityEstimateAPI().executeAutoTrainWorkflow(params.usecaseTemplates, params.plugin);
else {
	gs.error('EVENT: piwb.data_analysis_auto_train: Instance is not eligible for pretrain. Predictability estimate workflow has been skipped');
}
