if (!pm.isZboot()) {
	var gr = new GlideRecord("ml_solution_definition");
	gr.query();
	var classification_def = [];
	while(gr.next()){
		var capability = gr.trainer.name;
		if (capability == 'classification_trainer'){
			classification_def.push(gr.getUniqueValue());
		}
		gr.setValue('capability',capability);
		gr.update();
	}
	
	var solution_gr = new GlideRecord('ml_solution');
	solution_gr.addQuery('capability','');
    solution_gr.query();
	while (solution_gr.next()) {
		var capability_val = '';
		if (!solution_gr.getValue('capability')){
			// only classification and similarity trainer are present pre New york
			if (classification_def.indexOf(solution_gr.getValue('solution_definition')) != -1){
				capability_val = 'classification_trainer';
			} else {
				capability_val = 'similarity_trainer';
			}
			solution_gr.setValue('capability',capability_val);
			solution_gr.update();
		}
	}
}
