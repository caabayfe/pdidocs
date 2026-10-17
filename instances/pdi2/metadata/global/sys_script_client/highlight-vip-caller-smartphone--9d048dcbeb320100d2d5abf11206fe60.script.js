function onChange(control, oldValue, newValue, isLoading) {
	// if the caller_id field is not present, then we can't add an icon anywhere
	if (!g_form.hasField('caller_id'))
		return;
		
	if (!newValue)
		return;

	if (newValue === oldValue && isLoading) {
		if (g_scratchpad.is_vip == 'true') {
			g_form.addDecoration('caller_id', 'icon-star', 'VIP');
		}

		return;
	}

	g_form.getReference('caller_id', function(ref) {
		g_form.removeDecoration('caller_id', 'icon-star', 'VIP');
		
		if (ref.getValue('vip') == 'true')
			g_form.addDecoration('caller_id', 'icon-star', 'VIP');			
	});
}
