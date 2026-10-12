function onLoad() {
	if (!g_scratchpad.form_section_error)
		return;
	var element = g_form.getDisplayBox('form_section');
	if (!element)
		return;
	element.title = g_scratchpad.form_section_error;
	addClassName(element, 'ref_invalid');
	element.setAttribute('aria-invalid', 'true');
	var control = g_form.getControl('form_section');
	if (control)
		control.value = '';
	g_form.showFieldMsg('form_section', g_scratchpad.form_section_error, 'error', null, 'invalid_reference');
}
