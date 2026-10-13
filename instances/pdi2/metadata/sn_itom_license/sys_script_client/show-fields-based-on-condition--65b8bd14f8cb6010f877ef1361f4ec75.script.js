function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	var QUERY = 'query';
	var TABLE_NAME = 'table_name';
	var SCRIPT = 'script';
	var CI_IDENTIFIER = "ci_identifier";
	
	
	if (isLoading || newValue === '') {
      return;
   }
	
	if(newValue == 'script') {
		g_form.setMandatory(TABLE_NAME,false);
		g_form.setMandatory(SCRIPT, true);
		g_form.setMandatory(QUERY,false);
		g_form.setDisplay(QUERY, false);		
		g_form.setDisplay(TABLE_NAME, false);
		g_form.setDisplay(SCRIPT, true);
		g_form.setDisplay(CI_IDENTIFIER, false);
		
	}
	else if(newValue == 'relationship'){
		g_form.setMandatory(SCRIPT, false);
		g_form.setDisplay(SCRIPT, false);
		g_form.setDisplay(QUERY, true);
		g_form.setMandatory(QUERY,true);
		g_form.setDisplay(TABLE_NAME, true);
		g_form.setDisplay(CI_IDENTIFIER, true);
		g_form.setMandatory(CI_IDENTIFIER,true);
		g_form.setValue(TABLE_NAME, 'cmdb_rel_ci'); // cmdb_rel_ci table's sys_id
		g_form.setDisabled(TABLE_NAME, true);
	}
	else {
		g_form.setMandatory(SCRIPT, false);
		g_form.setMandatory(QUERY,true);
		g_form.setDisplay(QUERY, true);
		g_form.setMandatory(TABLE_NAME,true);
		g_form.setDisplay(TABLE_NAME, true);
		g_form.setDisabled(TABLE_NAME, false);
		g_form.clearValue(TABLE_NAME);
		g_form.setDisplay(SCRIPT, false);
		g_form.setDisplay(CI_IDENTIFIER, false);
	}

   //Type appropriate comment here, and begin script below
   
}
