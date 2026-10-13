var mapGR = new GlideRecord('pa_breakdown_mappings');
mapGR.addQuery('facts_table', 'ml_predictor_results');
mapGR.query();
while (mapGR.next()){
	if (mapGR.getValue('field') == 'solution.solution_definition') {
		mapGR.setValue('field', 'solution.ml_capability_definition');
		mapGR.update();
	}
}

var relGR = new GlideRecord('pa_breakdown_relations');
relGR.addQuery('table', 'ml_predictor_results');
relGR.query();
while (relGR.next()) {
	if (relGR.getValue('breakdown_field') == 'solution.solution_definition') {
		relGR.setValue('breakdown_field', 'solution.ml_capability_definition');
		relGR.update();
	}
}

var dimGR = new GlideRecord('pa_dimensions');
dimGR.addQuery('facts_table', 'ml_solution_definition');
dimGR.query();
while (dimGR.next()){
	dimGR.setValue('facts_table','ml_capability_definition_base');
	dimGR.setValue('conditions','capability.value=classification_trainer');
	dimGR.update();
}

var filterGR = new GlideRecord('sys_ui_hp_cascading_filter');
filterGR.addQuery('table', 'ml_solution_definition');
filterGR.query();
while (filterGR.next()){
	filterGR.setValue('table','ml_capability_definition_base');
	filterGR.setValue('conditions','capability.value=classification_trainer');
	filterGR.update();
}

var filterRefGR = new GlideRecord('sys_ui_hp_cascading_filter_target_references');
filterRefGR.addQuery('filter_field', 'solution.solution_definition');
filterRefGR.query();
while (filterRefGR.next()){
	filterRefGR.setValue('filter_field','solution.ml_capability_definition');	
	filterRefGR.update();
}
