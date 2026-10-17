(function refineQuery(current, parent) {
	// The connection between the slow transactions table and the transaction call chain table is realized through the 
	// transaction table via the relationship described below, with the relevant colummns in '()':
	// Slow transaction(hash) -> (transaction_pattern)transaction(sys_id) <- (transaction_id)transaction_call_chain
	var gr = new GlideRecord('syslog_transaction');
	gr.addQuery('transaction_pattern', parent.hash);
	gr.addQuery('has_call_chain', true);
	gr.orderByDesc('sys_created_on');
	gr.query();
	if (gr.next()) {
		current.addQuery('transaction_log', gr.getUniqueValue());
	} else {
		current.addQuery('transaction_log', null);
	}
})(current, parent);
