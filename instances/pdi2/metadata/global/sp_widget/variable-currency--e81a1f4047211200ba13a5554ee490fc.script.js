(function() {
	var single_currency = (gs.getProperty('glide.i18n.single_currency') == 'true');
	var single_currency_code = '';
	
	if (single_currency) 
		single_currency_code = gs.getProperty('glide.i18n.single_currency.code') || '';
	
	var csym = {};
	csym.usd = {symbol: "$", location: "prefix"};
	csym.cad = {symbol: "$", location: "prefix"};
	csym.mxn = {symbol: "$", location: "prefix"};
	csym.eur = {symbol: "€", location: "prefix"};
	csym.gbp = {symbol: "£", location: "prefix"};
	
	var locale = GlideLocale.get();
	var cc = '';
	if (single_currency_code != '')
		cc = data.symbol = single_currency_code;
	else
		cc = data.symbol = locale.getCurrencyCode();
	
	cc = cc.toLowerCase();
	data.cc = cc;
	locale.getCurrencyCode();
	if (csym[cc]) 
		data.symbol = csym[cc].symbol;
})();
