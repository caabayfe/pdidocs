function onLoad() {
	if(g_form.getValue('name') == 'similarity_trainer') {
		
		g_form.setDisplay('solution_type',false);
		g_form.setDisplay('default_output_field',false);
		g_form.setDisplay('output_type',false);
		g_form.setDisplay("default_input_fields",false);
		g_form.setDisplay("default_input_filter",false);
		g_form.setDisplay("default_training_frequency",false);
		
		g_form.setDisplay('default_prediction_input_fields',true);
		g_form.setDisplay('default_similarity_window',true);
		g_form.setDisplay('lookup_window_size',true);
		g_form.setDisplay('default_threshold',true);
		g_form.setDisplay('default_update_frequency',true);
		g_form.setDisplay("word_vector_corpus",true);
	} else {
		
		g_form.setDisplay('solution_type',true);
		g_form.setDisplay('default_output_field',true);
		g_form.setDisplay('output_type',true);
		g_form.setDisplay("default_input_fields",true);
		g_form.setDisplay("default_input_filter",true);
		g_form.setDisplay("default_training_frequency",true);
		
		g_form.setDisplay('default_prediction_input_fields',false);
		g_form.setDisplay('default_similarity_window',false);
		g_form.setDisplay('lookup_window_size',false);
		g_form.setDisplay('default_threshold',false);
		g_form.setDisplay('default_update_frequency',false);
		g_form.setDisplay("word_vector_corpus",false);
	}
}
