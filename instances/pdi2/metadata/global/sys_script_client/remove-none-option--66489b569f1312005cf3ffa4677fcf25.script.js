function onLoad() {
   // In model we allow null to http_method for backward compatibility. However we need to remove this option from UI.
    g_form.removeOption('http_method', '');
	
}
