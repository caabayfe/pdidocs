// eslint-disable-next-line
    /* global NOW */
function onLoad() {
	var currencyCode = '';
	if (g_scratchpad.singleCurrencyEnabled === 'true') {
		currencyCode = g_scratchpad.costCurrency;
	} else {
		currencyCode = g_form.getValue('payment_amount').split(';')[0] || g_scratchpad.localeCurrencyCode;
	}
	var payment = g_form.getValue('payment_amount').split(';')[1];
	var tax = g_form.getValue('tax_cost').split(';')[1];
	var total = g_form.getValue('total_cost').split(';')[1];
	g_form.setValue('payment_amount', currencyCode + ';' + payment);
	g_form.setValue('tax_cost', currencyCode + ';' + tax);
	g_form.setValue('total_cost', currencyCode + ';' + total);
}
