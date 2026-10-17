function getCurrencyFilter(tablename, fieldname, currencyString) {
    var converter = new GlideConverter();
	var referenceCurrency = converter.getReferenceCurrencyCode();
	var amount = converter.parseDisplayValueAndConvert(currencyString, referenceCurrency);
	return parseFloat(amount);
}
