function onBefore(current, previous) {
	var other = new GlideRecord('sys_query_rewrite');
	other.addQuery('query_hash', current.query_hash);
	other.addQuery('type', 'query_replacement');
	other.addActiveQuery();
	if (current.operation() != 'insert') {
		// If we're updating, make sure this record isn't compared with itself
		other.addQuery('sys_id', '!=', current.getUniqueValue())
	}
	other.query();
	while (other.next()) {
		engineType = other.getValue('engine');
		if (engineType != current.engine) {
			continue;
		}
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("An active query replacement exists for this query. " +
			"<a target='_blank' href=' {0}'>Click here</a> to open it.",other.getLink(true)));
	}
}
