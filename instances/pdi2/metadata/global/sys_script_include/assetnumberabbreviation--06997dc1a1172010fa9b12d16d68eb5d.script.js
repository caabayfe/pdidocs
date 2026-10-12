/** This is a copy of dev/now-par-components/components/utils/src/number/get-number-abbreviated.js
NUMBER_SYMBOLS = [
  thousand,
  million,
  billion,
  trillion,
  quadrillion,
  quintillion,
];
* */

var AssetNumberAbbreviation = Class.create();
AssetNumberAbbreviation.prototype = {
	initialize: function() {
		this.NUMBER_SYMBOLS = [
			gs.getMessage('thousand_abbreviated'),
			gs.getMessage('million_abbreviated'),
			gs.getMessage('billion_abbreviated'),
			gs.getMessage('trillion_abbreviated'),
			gs.getMessage('quadrillion_abbreviated'),
			gs.getMessage('quintillion_abbreviated'),
		];
	},

	getNumberAbbreviatedWithCurrency: function(field, tableName, number, formattingOptions) {
		var symbol = null;
		var currCode = null;
		var currencyCode = new GlideRecord(tableName);
		currencyCode.setLimit(1);
		currencyCode.query();
		if (currencyCode.next() && !gs.nil(currencyCode[field].getReferenceCurrencyCode())) {
			if (gs.getProperty('glide.i18n.single_currency') === 'true') {
				currCode = gs.getProperty('glide.i18n.single_currency.code');
			} else {
				currCode = currencyCode[field].getReferenceCurrencyCode();
			}
			var sym = new GlideRecord('fx_currency');
			sym.addQuery('code', currCode);
			sym.query();
			if (sym.next()) {
				symbol = sym.getValue('symbol');
			}
		}
		var func = function(value, option) {
			return option.symbol + value;
		};
		var formatting = gs.nil(formattingOptions) ? {} : formattingOptions;
		formatting.symbol = symbol;

		return this.getNumberAbbreviated(number, formatting, func);
	},

	/**
	 * Returns an abbreviated number value. It accepts a formatting function which is used to format the final number.
	 * As a return value the formatted value is postfixed with the appropriate postfix which can be: K, M, B, t, q, Q
	 *
	 * Example: 1000000 is abbreviated as 1M
	 *
	 * @param  {Number}  [value] incoming number to be formatted
	 * @param  {Object}  [formattingOptions] options passed to the formatting function
	 * @param  {Function}  [formatterFunction] function to be used for additional formatting of the number
	 *
	 * @return {String} - Abbreviated number with formatting applied
	 * */
	getNumberAbbreviated: function getNumberAbbreviated(
		number,
		formattingOptions,
		formatterFunction
	) {
		var precision = formattingOptions.precision
			? formattingOptions.precision
			: 2;
		var decimalPlaces = Math.pow(10, precision); // eslint-disable-line no-restricted-properties

		var finalNumber = number;
		var postfix = '';

		var absValue = Math.abs(number);

		for (var i = this.NUMBER_SYMBOLS.length - 1; i >= 0; i--) {
			var roundedLargeNumber = Math.pow(10, (i + 1) * 3); // eslint-disable-line no-restricted-properties

			if (roundedLargeNumber > absValue) { continue; }

			var abbreviatedValue = Math.round((absValue * decimalPlaces) / roundedLargeNumber)
                / decimalPlaces;

			if (abbreviatedValue === 1000 && i < this.NUMBER_SYMBOLS.length - 1) {
				abbreviatedValue = 1;
				i += 1;
			}

			if (number < 0) {
				abbreviatedValue = -abbreviatedValue;
			}

			finalNumber = abbreviatedValue;
			postfix = this.NUMBER_SYMBOLS[i];

			break;
		}

		if (typeof formatterFunction === 'function') {
			finalNumber = formatterFunction(finalNumber, formattingOptions);
		}

		return finalNumber + postfix;
	},
	type: 'AssetNumberAbbreviation',
};
