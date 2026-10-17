(function executeRule(current, previous /*null when async*/) {
	var view_name = "";
	if (gs.getSession().isInteractive()) {
		var map = gs.action.getGlideURI().getMap();
		if (map.get('sysparm_view') != null) {
			view_name = map.get('sysparm_view').toString();
			if (view_name == 'welcome_hub_flow'){
				var condition = current.addQuery('type', '=', 'flow');
				current.appendOrQuery(condition, 'type', '=', '');
			}
			else if (view_name == 'welcome_hub_subflow')
				current.addQuery('type', 'subflow');
		}
	}
})(current, previous);
