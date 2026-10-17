(function executeRule(current, previous /*null when async*/ ) {
	var wrapUpUtil = new WrapUpInteractionUtil();
    var duration = wrapUpUtil.getWrapUpDuration(current);
	var enforceDuration = wrapUpUtil.isWrapUpDurationEnforced(current);
    if (enforceDuration && duration != -1) {
		var interaction = sn_interaction.Interaction.getInteraction(current);
		interaction.scheduleWrapupTimeout(duration);
    }

})(current, previous);
