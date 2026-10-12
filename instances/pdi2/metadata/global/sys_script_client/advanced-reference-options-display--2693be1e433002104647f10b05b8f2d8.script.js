function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (oldValue != newValue) {
		g_form.clearValue('reference_string');
		g_form.clearValue('reference_table');
		g_form.clearValue('doc_id_field');
		g_form.clearValue('doc_id_tablename_field');
	}
   if (newValue == "reference") {
		g_form.setMandatory('reference_field', false);
		g_form.setMandatory('reference_string', true);
		g_form.setMandatory('reference_table', true);
		g_form.setMandatory('doc_id_field', false);
		g_form.setMandatory('doc_id_tablename_field', false);
		g_form.setDisplay('reference_string', true);
		g_form.setDisplay('reference_table', true);
		g_form.setDisplay('doc_id_field', false);
		g_form.setDisplay('doc_id_tablename_field', false);
		
   } else if (newValue == "document_id") {
		g_form.setMandatory('reference_field', false);
		g_form.setMandatory('doc_id_field', true);
		g_form.setMandatory('doc_id_tablename_field', true);
		g_form.setMandatory('reference_string', false);
		g_form.setMandatory('reference_table', false);
		g_form.setDisplay('reference_string', false);
		g_form.setDisplay('reference_table', false);
		g_form.setDisplay('doc_id_field', true);
		g_form.setDisplay('doc_id_tablename_field', true);
		
   } else {
		g_form.setMandatory('reference_field', true);
		g_form.setMandatory('reference_string', false);
		g_form.setMandatory('reference_table', false);
		g_form.setMandatory('doc_id_field', false);
		g_form.setMandatory('doc_id_tablename_field', false);
		g_form.setDisplay('reference_string', false);
		g_form.setDisplay('reference_table', false);
		g_form.setDisplay('doc_id_field', false);
		g_form.setDisplay('doc_id_tablename_field', false);
   }
}
