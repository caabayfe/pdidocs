function onLoad() {
  if (g_form.isNewRecord()) {
    g_form.setDisplay('active', false); 
    g_form.setDisplay('record_estimate', false); 
    g_form.setDisplay('estimate_date', false); 
    g_form.setDisplay('last_run_date', false); 
    g_form.setDisplay('next_run_date', false); 
    g_form.setDisplay('total', false); 
	g_form.showFieldMsg('table', 'Only tables in the current application are valid options', 'info');
  }  
}
