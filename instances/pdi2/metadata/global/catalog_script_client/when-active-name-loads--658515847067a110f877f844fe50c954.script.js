function onLoad() {
   if (g_form.getValue('active') === 'true') {
	getMessage('Active', function(msg) {
		g_form.setValue('active_name', msg);
	});
   }
   else {
	getMessage('Inactive', function(msg) {
		g_form.setValue('active_name', msg);
	});
   }
}
