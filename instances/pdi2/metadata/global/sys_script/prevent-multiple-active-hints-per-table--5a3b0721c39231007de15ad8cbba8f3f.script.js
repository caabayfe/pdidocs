function onBefore(current, previous) {
	// Find other active hints for this query_hash and correlation alias
	var other = new GlideRecord('sys_query_index_hint');
	other.addQuery('query_hash', current.query_hash);
	other.addQuery('correlation_name', current.correlation_name);
	other.addActiveQuery();
	if (current.operation() != 'insert') {
		// If we're updating, make sure this record isn't compared with itself
		other.addQuery('sys_id', '!=', current.getUniqueValue())
	}
	other.query();
	if (other.next()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("An active index hint exists for the same table in this query." +
			"<a target='_blank' href='{0}'>Click here</a> to open it.",other.getLink(true)));
	}
}
