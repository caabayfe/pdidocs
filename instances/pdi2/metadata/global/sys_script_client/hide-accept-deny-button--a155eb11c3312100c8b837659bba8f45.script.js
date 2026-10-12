function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	$$('.line_item_veto_control').each(function(elem) {
		if (g_form.getValue('state') != 'requested')
			elem.style.display = "none";
		else
			elem.style.display = "inline-block";
		
	})
}
