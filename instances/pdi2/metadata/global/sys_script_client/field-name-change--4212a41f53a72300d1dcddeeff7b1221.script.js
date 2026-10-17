function onLoad() {
   //Type appropriate comment here, and begin script below
	var view = getView();
	var sol_template = g_form.getValue('trainer');
	var sol_capability = "";
	if(sol_template) {
		var gr = new GlideRecord('ml_trainer_definition');
		if (gr.get(sol_template)) {
			sol_capability = gr.getValue("name");
		}
	}	
	if (view == 'classification') {
         
	} else if (view == 'similarity') {
		
	} else if (view == 'clustering' || sol_capability == "clustering_trainer") {
		g_form.setLabelOf('training_frequency','Recluster frequency');
	}
}
