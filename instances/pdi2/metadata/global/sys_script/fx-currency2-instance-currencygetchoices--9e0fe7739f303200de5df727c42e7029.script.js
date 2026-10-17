function fx_currency2_instance_currencyGetChoices() {
	var iter = new SNC.CurrencyAccessor().getActiveCurrencies().iterator();
	
	while(iter.hasNext()) {
		var currency = iter.next();
		answer.add(currency.getCode(), currency.getDescription());
	}
	answer.removeNone();
}
