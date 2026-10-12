function onLoad() {
   //Type appropriate comment here, and begin script below
   var executionMode = g_form.getValue('execution_mode');
   var serverMode = (executionMode === 'server') || (executionMode === '') || (executionMode === null);
   g_form.setMandatory('script', serverMode);
   g_form.setDisplay('script', serverMode);
}
