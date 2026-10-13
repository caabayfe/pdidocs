var isEligible = new sn_ml.TrainingRequest().isInstanceAutoTrainingEligible() + '';
var isEligibleFromProps = gs.getProperty(PIWBConstants.PROPS.AUTO_TRAIN_INSTANCE_ELIGIBLE, null);
if(isEligible != isEligibleFromProps) {
	gs.setProperty(PIWBConstants.PROPS.AUTO_TRAIN_INSTANCE_ELIGIBLE, isEligible);
	gs.debug('{0} Property has been updated. old_value: {1}, new_value: {2}', [PIWBConstants.PROPS.AUTO_TRAIN_INSTANCE_ELIGIBLE, isEligibleFromProps, isEligible]);
}
else {
	gs.debug('{0} Property update has been skipped. old_value: {1}, new_value: {2}', [PIWBConstants.PROPS.AUTO_TRAIN_INSTANCE_ELIGIBLE, isEligibleFromProps, isEligible]);
}
