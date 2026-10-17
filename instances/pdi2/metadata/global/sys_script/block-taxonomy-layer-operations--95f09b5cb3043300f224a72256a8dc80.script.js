(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('spm_taxonomy_node');
	var query = 'spm_service_portfolio='+current.spm_service_portfolio;

	if (current.operation() != 'insert' && previous.spm_service_portfolio != current.spm_service_portfolio)
		query += '^ORspm_service_portfolio='+previous.spm_service_portfolio;

	gr.addEncodedQuery(query);
	gr.query();

	if (!gr.next())
		return;

	switch (current.operation()){
		case 'insert':
			gs.addErrorMessage(gs.getMessage('This layer cannot be created because there are taxonomy layers in this portfolio that contain nodes'));
			current.setAbortAction(true);
			break;
		case 'update':
			if (previous.order != current.order || previous.spm_service_portfolio != current.spm_service_portfolio){
				gs.addErrorMessage(gs.getMessage('A node for this portfolio has been created already. Taxonomy layers ordering and portfolio reassignments are locked'));
				current.setAbortAction(true);
			}
			break;
		case 'delete':
			gs.addErrorMessage(gs.getMessage('This layer cannot be deleted because there are taxonomy layers in this portfolio that contain nodes'));
			current.setAbortAction(true);
			break;
	}

})(current, previous);
