(function executeRule(current, previous /* null when async */) {
	g_scratchpad.costCurrency = current.payment_amount.getCurrencyCode();
	g_scratchpad.singleCurrencyEnabled = gs.getProperty('glide.i18n.single_currency');
	g_scratchpad.localeCurrencyCode = GlideLocale.get().getCurrencyCode();
	if (gs.getProperty('glide.i18n.single_currency') === 'true') {
		g_scratchpad.costCurrency = gs.getProperty('glide.i18n.single_currency.code');
	}
}(current, previous));
