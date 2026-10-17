function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
	   if(newValue === '')
		   g_form.setValue("cube_facts_table", "--None--");
      return;
   }

    //Set the correct table name to table_name
	var cubeGr = new GlideRecord("pa_cubes");
	cubeGr.get(newValue);
	g_form.setValue("table_name", cubeGr.facts_table);
   
}
