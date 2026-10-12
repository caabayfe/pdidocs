function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue == '') {
        return;
    }

    //checking if sales_tax is checked
	if (g_form.getValue('sales_tax') === 'true' && g_form.getValue('tax_exempt') === 'true') {
		g_form.setValue('tax_exempt', 'false');
		g_form.setMandatory('tax_rate', true);
		g_form.setValue('tax_rate', '7' + g_scratchpad.decimalSeparator + '75');
		g_form.setReadOnly('tax_rate', false);
	} 
	if (g_form.getValue('sales_tax') === 'false' && g_form.getValue('tax_exempt') === 'false') {
		g_form.setValue('tax_exempt', 'true');
		g_form.setValue('tax_rate', '');
		g_form.setMandatory('tax_rate', false);
		g_form.setReadOnly('tax_rate', true);
	}
}
