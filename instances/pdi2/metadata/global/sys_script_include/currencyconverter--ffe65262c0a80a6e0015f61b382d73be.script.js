gs.include("PrototypeServer");

var CurrencyConverter = Class.create();

CurrencyConverter.prototype = Object.extendsObject(AbstractAjaxProcessor, {
  process: function() {
    if(this.getName() == 'convertStorageValue')
       return this.convertStorageValue(this.getType(), this.getValue());
    if(this.getName() == 'getCurrencies')
       return this.getCurrencies();
  },

  convert: function(gr) {
    if (!gr.currency) {
      // user locale
      var locale = getLocale();
      var c = getCurrency(locale);
      gr.currency.setDisplayValue(c.getCurrencyCode());
    }

    var from = gr.currency.getDisplayValue();

    // system locale (reference currency)
    var sysLocale = getSystemLocale();
    var converter = new GlideConverter();
    var referenceCurrencyCode = converter.getReferenceCurrencyCode();
    gr.reference_amount = converter.parseValueAndConvert(current.amount, from, referenceCurrencyCode);

    // gr.reference_currency is a reference field to fx_currency, it should be set with sys id to resolve DEF0261719
    // update reference_currency only if it is null or new referenceCurrencyCode does not match with existing value
    if (gs.nil(gr.reference_currency) || gr.getDisplayValue("reference_currency") != referenceCurrencyCode) {
        var currencyGR = new GlideRecord("fx_currency");
        if (currencyGR.get("code", referenceCurrencyCode))
            gr.reference_currency = currencyGR.getValue("sys_id");
    }
  },

  convertStorageValue: function(from, value) {
    var c = new GlideConverter();
    return c.convert(value, from, 'USD');
  },

  getCurrencies: function() {
    var array = new SNC.CurrencyAccessor().getActiveCurrencies().toArray();
    return array.map(function(item) {
		return item.getCode();
	}).join(",");
  },
  
  isPublic: function() {
    return false;
  }
});

function getSystemLocale() {
  return GlideLocale.get().getSystemLocale();
}


// session locale
function getLocale() {
  return GlideLocale.get().getCurrent();
}

function getCurrency(locale) {
  return Packages.java.util.Currency.getInstance(locale);
}
