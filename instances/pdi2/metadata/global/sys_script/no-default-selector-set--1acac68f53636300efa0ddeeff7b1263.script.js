(function executeRule(current, previous /*null when async*/) {
	var selectorGr = new GlideRecord("notify_group_selector");
	selectorGr.addActiveQuery();
	selectorGr.addQuery('default_group', true);
	selectorGr.query();
	if (!selectorGr.next()) {
		gs.addInfoMessage(gs.getMessage("No active selector is set as catch-all"));
	}
})(current, previous);
