function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '' || oldValue == newValue) {
      return;
   }
	var gr = new GlideRecord('ml_trainer_definition');
	if (gr.get(newValue)) {
		var sol_capability = gr.getValue("name");
		var fieldsObjArr = [];
		if (sol_capability == 'similarity_trainer') {
			fieldsObjArr = [
                {'field_name':'input_fields', 'set_mandatory': false, 'set_display': false},
                {'field_name':'input_filter', 'set_mandatory': false, 'set_display': false},
                {'field_name':'output_field', 'set_mandatory': 'NA', 'set_display': false},
                {'field_name':'dataset_language', 'set_mandatory': 'NA', 'set_display': true},
                {'field_name':'training_frequency', 'set_mandatory': 'NA', 'set_display': true},
                {'field_name':'word_vector_corpus', 'set_mandatory': true, 'set_display': true},
                {'field_name':'prediction_input_fields', 'set_mandatory': true, 'set_display': true},
                {'field_name':'lookup_window_size', 'set_mandatory': true, 'set_display': true},
                {'field_name':'similarity_window_filter', 'set_mandatory': 'NA', 'set_display': true},
                {'field_name':'update_frequency', 'set_mandatory': 'NA', 'set_display': true},
                {'field_name':'fields_to_compare', 'set_mandatory': true, 'set_display': true},
                {'field_name':'threshold', 'set_mandatory': 'NA', 'set_display': false},
                {'field_name':'min_records', 'set_mandatory': 'NA', 'set_display': false},
                {'field_name':'max_count', 'set_mandatory': 'NA', 'set_display': false}
            ];
            setfieldAttr(fieldsObjArr);
		} else if(sol_capability == 'classification_trainer') {
			fieldsObjArr = [
                {'field_name':'output_field', 'set_mandatory': 'NA', 'set_display': true},
                {'field_name':'dataset_language', 'set_mandatory': 'NA', 'set_display': true},
                {'field_name':'input_fields', 'set_mandatory': true, 'set_display': true},
                {'field_name':'input_filter', 'set_mandatory': true, 'set_display': true},
                {'field_name':'training_frequency', 'set_mandatory': 'NA', 'set_display': true},
                {'field_name':'prediction_input_fields', 'set_mandatory': false, 'set_display': false},
                {'field_name':'lookup_window_size', 'set_mandatory': false, 'set_display': false},
                {'field_name':'similarity_window_filter', 'set_mandatory': 'NA', 'set_display': false},
                {'field_name':'update_frequency', 'set_mandatory': 'NA', 'set_display': false},
                {'field_name':'fields_to_compare', 'set_mandatory': false, 'set_display': false},
                {'field_name':'word_vector_corpus', 'set_mandatory': false, 'set_display': false},
                {'field_name':'threshold', 'set_mandatory': 'NA', 'set_display': false},
                {'field_name':'min_records', 'set_mandatory': 'NA', 'set_display': false},
                {'field_name':'max_count', 'set_mandatory': 'NA', 'set_display': false}
            ];
            setfieldAttr(fieldsObjArr);
		} else if (sol_capability == 'clustering_trainer') {
            fieldsObjArr = [
                {'field_name':'output_field', 'set_mandatory': 'NA', 'set_display': false},
                {'field_name':'dataset_language', 'set_mandatory': 'NA', 'set_display': false},
                {'field_name':'input_fields', 'set_mandatory': false, 'set_display': false},
                {'field_name':'input_filter', 'set_mandatory': false, 'set_display': false},
                {'field_name':'training_frequency', 'set_mandatory': 'NA', 'set_display': true},
                {'field_name':'prediction_input_fields', 'set_mandatory': true, 'set_display': true},
                {'field_name':'lookup_window_size', 'set_mandatory': true, 'set_display': true},
                {'field_name':'similarity_window_filter', 'set_mandatory': 'NA', 'set_display': true},
                {'field_name':'update_frequency', 'set_mandatory': 'NA', 'set_display': true},
                {'field_name':'fields_to_compare', 'set_mandatory': false, 'set_display': false},
                {'field_name':'word_vector_corpus', 'set_mandatory': true, 'set_display': true},
                {'field_name':'threshold', 'set_mandatory': 'NA', 'set_display': true},
                {'field_name':'min_records', 'set_mandatory': 'NA', 'set_display': true},
                {'field_name':'max_count', 'set_mandatory': 'NA', 'set_display': true}
            ];
            setfieldAttr(fieldsObjArr);
        }
	} 
}

function setfieldAttr(fieldsObjArr) {
    for (var index in fieldsObjArr) {
		var field = fieldsObjArr[index];
        if (field.set_mandatory != 'NA') {
            g_form.setMandatory(field.field_name,field.set_mandatory);
        }
        g_form.setDisplay(field.field_name,field.set_display);
    }
}
