(function refineQuery(current, parent) {
	var allProposals = [];

	var gr = new GlideRecord('std_change_producer_version');
	gr.addQuery('std_change_producer', parent.getUniqueValue());
	gr.query();
	while (gr.next()) {
		allProposals.push(gr.getValue('std_change_proposal'));
	}

	var qc = current.addQuery('sys_id', 'IN', allProposals.join(','));

	// Including in process or rejected proposals
	var orCond = qc.addOrCondition('std_change_producer_version', null);
	orCond.addCondition('proposal_type', 'IN', '2,3');
	orCond.addCondition('std_change_producer', parent.getUniqueValue());

	current.orderByDesc('number');

})(current, parent);
