function onLoad() {
   //Hiding the related list if there are no records to show
	/* Commented out for now due to no access to client-side gliderecord on scoped apps..
	var nodeId = g_form.getUniqueValue();
	var serviceTaxonomy = new GlideRecord('cmdb_ci_service');
	serviceTaxonomy.addQuery('spm_taxonomy_node', nodeId);
	serviceTaxonomy.query(checkServiceQuery);
	
	function checkServiceQuery(serviceTaxonomy) {
		if (!serviceTaxonomy.hasNext())
			g_form.hideRelatedList('cmdb_ci_service.spm_taxonomy_node');
	}
	*/
}
