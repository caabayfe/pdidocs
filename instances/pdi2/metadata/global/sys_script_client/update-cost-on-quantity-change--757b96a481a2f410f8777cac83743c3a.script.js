function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	function getModel(model) {
		var cost = parseFloat(model.cost);
		var currencyScratchpad = g_scratchpad.costCurrency;
		var currency = g_form.getValue('cost').split(';')[0];
		var qty = g_form.getDecimalValue('quantity');
		var totalCost = cost * qty;
		if (!(isNaN(currency) && currency !== undefined && currency.length === 3)) {
			currency = currencyScratchpad;
		}
		g_form.setValue('cost', currency + ';' + totalCost);
	}
	g_form.getReference('model', getModel);
}
