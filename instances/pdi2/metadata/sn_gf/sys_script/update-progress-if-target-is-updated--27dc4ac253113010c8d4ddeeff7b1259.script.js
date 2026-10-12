(function executeRule(current, previous /*null when async*/) {
	var targetType = !current.measure.choice_set && current.type != 'milestone'?'quantitative':'qualitative';
	new TargetProgressUtil(current).updateTargetProgressWithNewTargetValue(targetType);

})(current, previous);
