function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	// if the icon_image field is not present, then we can't add a decorator anywhere
	if (!g_form.hasField('icon_image'))
		return;
		
	g_form.hideFieldMsg('icon_image', true);
	if (!newValue)
		return;

	var editImage = $("edit.quickactions_workspace_action.icon_image");	
	if (editImage) {
		g_form.addDecoration('icon_image', 'icon-required', '');
	} else {
		g_form.addDecoration('icon_image', 'icon-required', '', 'color-red');
		g_form.showFieldMsg('icon_image', 
			getMessage('Please upload an image with a square aspect ratio.'), 'warning');
	}
}
