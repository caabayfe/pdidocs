(function refineQuery(current, parent) {
	var allProposals = [];
	var producerId;
	var gr;
	var parentProposalId = parent.getUniqueValue();

	if (parent.getValue('proposal_type') != 1) {
		producerId = parent.getValue('std_change_producer');
	} else {
		// For New proposals it won't have direct reference to producer.
		// We need to go through version, but version is not created
		// unless it is approved.
		var versionId = parent.getValue('std_change_producer_version');
		if (JSUtil.notNil(versionId)) {
			// Means this is approved.
			// For some reason dot walk is not working! So manually quering.
			gr = new GlideRecord('std_change_producer_version');
			if (gr.get(versionId)) {
				producerId = gr.getValue('std_change_producer');
			}
		}
	}

	if (JSUtil.notNil(producerId)) {
		gr = new GlideRecord('std_change_producer_version');
		gr.addQuery('std_change_producer', producerId);
		gr.query();
		while (gr.next()) {
			var proposalId = gr.getValue('std_change_proposal');
			if (proposalId != parentProposalId)
				allProposals.push(proposalId);
		}
	}

	current.addQuery('sys_id', 'IN', allProposals.join(','));

})(current, parent);
