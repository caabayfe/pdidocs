var gr = new GlideRecord("ml_capability_definition_clustering");
gr.initialize();
if (gr.isValidField('cal_purity')) {
	var clustering_def = new GlideRecord("ml_capability_definition_clustering");
	clustering_def.query();
	while (clustering_def.next()) {
		if (clustering_def.getValue('cal_purity') == null)  {
			if (clustering_def.getValue('purity_fields') == null){
				clustering_def.setValue('cal_purity',0);
			} else {
				clustering_def.setValue('cal_purity',1);
			}
			clustering_def.update();
		}
	}	
}
