function onLoad() {
  if (g_form.isNewRecord()) {
    g_form.setDisplay('active', false); 
    g_form.setDisplay('record_estimate', false); 
    g_form.setDisplay('estimate_date', false); 
    g_form.setDisplay('total', false); 
  }  
}
