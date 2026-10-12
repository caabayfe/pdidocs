checkDatatypeAndTemplate();

function checkDatatypeAndTemplate() {
	//Get all metrics in this category
	var allMetrics = new GlideRecord('asmt_metric');
	allMetrics.addQuery("category" , current.category);
	allMetrics.query();

	//Search for dependencies
	while (allMetrics.hasNext()) {
		allMetrics.next();	
		
		if (allMetrics.depends_on == current.sys_id) {
			gs.addErrorMessage(gs.getMessage("Cannot change the Datatype while '{0}' depends on this record", allMetrics.name));
			current.setAbortAction(true);
		}
	}
	
}
