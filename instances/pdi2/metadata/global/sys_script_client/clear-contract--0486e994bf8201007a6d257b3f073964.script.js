function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '') {
		return;
	}
	var cont = g_form.getValue('contract');
	// if the new chosen vendor does not match the contract, remove the contract
	if(cont != ''){
		var gr = new GlideRecord('ast_contract');
		gr.get(cont);
		if(gr.vendor != newValue)
			g_form.setValue('contract', '');
	}
	
}
