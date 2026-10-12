function onLoad() {
   //Type appropriate comment here, and begin script below
	CustomEvent.observe('getTableColumnsResponse.received', function() {
		g_form.removeOption('field','');
	});
}
