function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
	  if(newValue === '')
		g_form.clearOptions("field");

      return;
   }
   //Set the correct table name to cube_facts_table
	var gr = new GlideRecord("pa_indicators");
	gr.get(newValue);
	var cubeGr = new GlideRecord("pa_cubes");
	cubeGr.get(gr.cube);
	var tableName = cubeGr.facts_table;
	g_form.setValue("cube_facts_table", tableName);
}
