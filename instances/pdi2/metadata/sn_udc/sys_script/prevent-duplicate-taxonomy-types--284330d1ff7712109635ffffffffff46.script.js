(function executeRule(current, previous /*null when async*/) {
	const table = current.getValue('table');
	const conditionQuery = current.getValue('condition_query');

	const gr = FileTaxonomy.findTaxonomyType(table, conditionQuery);
	if (gr.next() && gr.getUniqueValue() != current.getUniqueValue()) {
		gs.addErrorMessage(
			gs.getMessage(
				'Taxonomy Type with table: {0} and condition_query: {1} already exists.',
				[table, conditionQuery]
			)
		);
		current.setAbortAction(true);
	}
})(current, previous);
