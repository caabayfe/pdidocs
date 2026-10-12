function onCondition() {
	if (g_scratchpad.latest_ml_solution_state_in_training == "true") {
		g_form.addInfoMessage("This solution definition is read only until solution training completes.");
		g_form.setReadOnly('input_fields', true);
		g_form.setReadOnly('trainer', true);
		g_form.setReadOnly('input_filter', true);
		g_form.setReadOnly('output_field', true);
		g_form.setReadOnly('solution_label', true);
		g_form.setReadOnly('table', true);
		g_form.setReadOnly('training_frequency', true);
		g_form.setReadOnly('prediction_input_fields', true);
		g_form.setReadOnly('update_frequency', true);
		g_form.setReadOnly('lookup_window_size', true);
		g_form.setReadOnly('sys_domain', true);
		g_form.setReadOnly('similarity_window_filter', true);
		g_form.setReadOnly('dataset_language', true);
		g_form.setReadOnly('table_to_compare', true);
		g_form.setReadOnly('fields_to_compare', true);
		g_form.setReadOnly('word_vector_corpus', true);
	}
}
