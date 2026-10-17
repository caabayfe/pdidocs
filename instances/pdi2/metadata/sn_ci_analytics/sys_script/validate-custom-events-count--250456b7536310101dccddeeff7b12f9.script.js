(function executeRule(current, previous /*null when async*/ ) {
    var type = current.type;
    var MAX_CUSTOM_EVENTS_MESSAGE = gs.getMessage('Custom events cannot be more than 20');
    if (type == 'Custom') {
        var count = new GlideAggregate('sn_ci_analytics_event');
        count.addQuery('type', '=','Custom');
        count.addAggregate('COUNT');
        count.query();
        var customEvents = 0;
        if (count.next())
            customEvents = count.getAggregate('COUNT');
        if (customEvents == 20) {
			gs.addInfoMessage(MAX_CUSTOM_EVENTS_MESSAGE);
			current.setAbortAction(true);
		}
    }
})(current, previous);
