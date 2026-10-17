function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	var trainerDefinition = new GlideRecord('ml_trainer_definition');
	if (trainerDefinition.get(newValue) ) {
		var sol_capability = trainerDefinition.getValue("name");
		var gr = new GlideRecord('ml_trainer_definition');
		
		//if old trainer capability is same as new trainer capability than no need to hideandshow fields
		if ( !gr.get(oldValue) || ((gr.getValue("name") != sol_capability )) ){
			showHideFields(sol_capability);
		}
		
		// copying common fields
		if (g_form.hasField('table') && (g_form.getValue("table") != trainerDefinition.default_table)) {
			g_form.setValue("table", trainerDefinition.getValue("default_table"));
		}

		// copying classification fields
		if (g_form.hasField("input_filter") && (g_form.getValue("input_filter") != trainerDefinition.default_input_filter)) {
			g_form.setValue("input_filter", trainerDefinition.getValue("default_input_filter"));
		}

		//Clustering and Classification fields
		if (g_form.hasField("training_frequency") && (g_form.getValue("training_frequency") != trainerDefinition.default_training_frequency)) {
			g_form.setValue("training_frequency", trainerDefinition.default_training_frequency);
		}

		//copying similarity fields
		if (g_form.hasField("word_vector_corpus") && (g_form.getValue("word_vector_corpus") != trainerDefinition.getValue('word_vector_corpus'))){
			g_form.setValue("word_vector_corpus",trainerDefinition.getValue('word_vector_corpus'));
		}

		if (g_form.hasField("lookup_window_size") && (g_form.getValue("lookup_window_size") != trainerDefinition.lookup_window_size)) {
			g_form.setValue("lookup_window_size", trainerDefinition.lookup_window_size);
		}
		if (g_form.hasField("similarity_window_filter") && (g_form.getValue("similarity_window_filter") != trainerDefinition.default_similarity_window)) {
			g_form.setValue("similarity_window_filter", trainerDefinition.default_similarity_window);
		}
		if (g_form.hasField("update_frequency") && (g_form.getValue("update_frequency") != trainerDefinition.default_update_frequency)) {
			g_form.setValue("update_frequency", trainerDefinition.default_update_frequency);
		}

	   //copying clustering fields
		if (g_form.hasField("segmentation_field") && (g_form.getValue("segmentation_field") != trainerDefinition.segmentation_field)) {
			g_form.setValue("segmentation_field", trainerDefinition.segmentation_field);
		}

		var fieldArr = [];
		var glideListField = ''; 
		//input fields and output fields are set for the classification solution
		if (g_form.hasField("input_fields")) {
			glideListField = 'input_fields';
			fieldArr.push({'input_fields':trainerDefinition.getValue("default_input_fields")});
			fieldArr.push({'output_field':trainerDefinition.getValue("default_output_field")});
			_setFieldList(glideListField, fieldArr);
		}

		//prediction input fields is set for the similarity solution and clustering solution
		else if (g_form.hasField("prediction_input_fields")) {
			glideListField = 'prediction_input_fields';
			fieldArr.push({'prediction_input_fields':trainerDefinition.getValue("default_prediction_input_fields")});
			_setFieldList(glideListField, fieldArr);
		}
	}
}

/*FieldList type of fields(input_fields, prediction_input_fields) depends on table
*due to slowness of instance, we might need some delay to set the value to fields 
*/
function _setFieldList(glideListField, fieldArr) {
	//ni.ml_solution_definition.prediction_input_fields.select_0
	for(var i=0; i<fieldArr.length; i++){
		var key = Object.keys(fieldArr[i])[0];
		var val = fieldArr[i][key];
		g_form.setValue(key,val);
	}
	if(g_form.getValue('table') == "")
		return;
	if (g_form.getElement('ni.ml_solution_definition.'+glideListField+'.select_0').length === 0){
		setTimeout(_setFieldList, 500, glideListField, fieldArr);
		return;
	}
}

function showHideFields (sol_capability) {
	var fieldsObjArr = [];
	// hide and show fields for a particular trainer capability
	if (sol_capability == 'similarity_trainer') {
		fieldsObjArr = [
			{'field_name':'input_fields', 'set_mandatory': false, 'set_display': false},
			{'field_name':'input_filter', 'set_mandatory': false, 'set_display': false},
			{'field_name':'output_field', 'set_mandatory': false, 'set_display': false},
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
			{'field_name':'max_count', 'set_mandatory': 'NA', 'set_display': false},
		];
		setfieldAttr(fieldsObjArr);
	} else if(sol_capability == 'classification_trainer') {
		fieldsObjArr = [
			{'field_name':'output_field', 'set_mandatory': true, 'set_display': true},
			{'field_name':'dataset_language', 'set_mandatory': 'NA', 'set_display': true},
			{'field_name':'input_fields', 'set_mandatory': true, 'set_display': true},
			{'field_name':'input_filter', 'set_mandatory': false, 'set_display': true},
			{'field_name':'training_frequency', 'set_mandatory': 'NA', 'set_display': true},
			{'field_name':'prediction_input_fields', 'set_mandatory': false, 'set_display': false},
			{'field_name':'lookup_window_size', 'set_mandatory': false, 'set_display': false},
			{'field_name':'similarity_window_filter', 'set_mandatory': 'NA', 'set_display': false},
			{'field_name':'update_frequency', 'set_mandatory': 'NA', 'set_display': false},
			{'field_name':'fields_to_compare', 'set_mandatory': false, 'set_display': false},
			{'field_name':'word_vector_corpus', 'set_mandatory': false, 'set_display': false},
			{'field_name':'threshold', 'set_mandatory': 'NA', 'set_display': false},
			{'field_name':'min_records', 'set_mandatory': 'NA', 'set_display': false},
			{'field_name':'max_count', 'set_mandatory': 'NA', 'set_display': false},
		];
		setfieldAttr(fieldsObjArr);
	} else if (sol_capability == 'clustering_trainer') {
		fieldsObjArr = [
			{'field_name':'output_field', 'set_mandatory': false, 'set_display': false},
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
		];
		setfieldAttr(fieldsObjArr);
	}
}

// set mandatory and display attr of the field
function setfieldAttr(fieldsObjArr) {
    for (var index in fieldsObjArr) {
		var field = fieldsObjArr[index];
        if (field.set_mandatory != 'NA') {
            g_form.setMandatory(field.field_name,field.set_mandatory);
        }
        g_form.setDisplay(field.field_name,field.set_display);
    }
}
