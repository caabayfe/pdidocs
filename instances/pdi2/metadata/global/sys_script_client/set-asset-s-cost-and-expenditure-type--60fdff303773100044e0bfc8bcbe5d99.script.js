function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '') {
		return;
	}

	var model = g_form.getReference('model', setExpenditureType);
}


function setExpenditureType(model) {
	g_form.setValue('expenditure_type', model.expenditure_type);

	var pluginstatus = new GlideAjax("SAMAjaxUtil");
	pluginstatus.addParam("sysparm_name", "getPluginInfo");
	pluginstatus.addParam("sysparm_plugin_id", "com.snc.sams");

	pluginstatus.getXML(function (response) {
		var items = response.responseXML.getElementsByTagName("values");
		// If sams plugin is active, then set unit cost else total cost
		var isActive = items[0].getAttribute("status");
		var currentTable = g_form.getTableName();

		if (isActive === 'true' && currentTable === 'alm_license') {
		  var currencyCode = g_form.getValue('unit_cost.currency');
			var currencyCodeScratch = g_scratchpad.unitCostCurrency;
		  if (!(isNaN(currencyCode) && currencyCode !== undefined && currencyCode.length === 3)) {
			  currencyCode = currencyCodeScratch;
	  	}
			var unitCostDisplayValue = currencyCode + ';' + model.cost;
			g_form.setValue('unit_cost', unitCostDisplayValue);

		} else {
      var qty = g_form.getDecimalValue('quantity');
      if(currentTable === 'alm_consumable' && qty > 1) {
        var currency = g_form.getValue('cost.currency');
        var totalCost = model.cost * qty;
        var costDisplayValue = currency + ';' + totalCost;
        g_form.setValue('cost', costDisplayValue);
      } else {
        g_form.setValue('cost', model.cost);
      }
    }

	});
}
