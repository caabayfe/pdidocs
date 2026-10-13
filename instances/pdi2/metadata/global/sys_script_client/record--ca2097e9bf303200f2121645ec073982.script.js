function onSubmit() {
	var maxThreads = g_form.getValue('max_threads'); 
  
	if( maxThreads != '' && maxThreads < 9) {
		g_form.showFieldMsg('max_threads', 'Max thread can not be less than 9', 'warning');
		return false;
   }
}
