function onLoad() {
    // For a licensable app, 'None' isn't a valid choice for Enforcement
	var licensable = g_form.getValue('licensable');
	if (licensable ) {
		// remove None as a choice for enforcement
		g_form.removeOption('enforce_license', 'none');
	}
   
}
