(function executeRule(current, previous /*null when async*/ ) {
    var duration = current.wrap_up_configuration.duration;
    if (current.wrap_up_configuration.enforce_duration && duration != -1) {
		sn_interaction.WrapUpSegment.scheduleWrapUpSegmentTimeout(current.getUniqueValue(), duration);
    }

})(current, previous);
