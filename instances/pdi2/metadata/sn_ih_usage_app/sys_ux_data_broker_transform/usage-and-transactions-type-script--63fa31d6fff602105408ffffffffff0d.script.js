function transform(input) {
	var usage_count = 0;
	var ihubUsageConditions = input.ihubUsageConditions || "license_id=IntegrationHubPool^sys_created_onBETWEENjavascript:gs.beginningOfLast12Months()@javascript:gs.endOfLastMonth()";
	var ga = new GlideAggregate("ua_ih_usage");
	ga.addEncodedQuery(ihubUsageConditions, true);
	ga.query();
	while(ga.next()) {
		var countVal = ga.getValue('use_count');
		if (countVal) {
			usage_count = usage_count + parseInt(countVal);
		}
	}

	var transactionTypeConditions = input.transactionTypeConditions || "sys_created_onBETWEENjavascript:gs.beginningOfLast12Months()@javascript:gs.endOfLastMonth()";

	var transactionTypesArr = [];
	var transactionTypeObj = {};
	var transactionTypes = new GlideAggregate("ua_ih_usage");
	transactionTypes.addEncodedQuery(transactionTypeConditions, true);
	transactionTypes.query();
	while(transactionTypes.next()) {
		var countVal1 = transactionTypes.getValue('use_count');
		var sourceType = transactionTypes.getValue('license_id');
		if (!transactionTypeObj[sourceType]) {
			transactionTypeObj[sourceType] = {
                    "sum" : 0,
					"count" : 0,
                     "groupBy" : [{
                          "displayValue" : sourceType,
                          "value" : sourceType,
                          "field" : "license_id" 

                     }]};
		}
		countVal1 = transactionTypeObj[sourceType].sum + parseInt(countVal1);
		transactionTypeObj[sourceType].sum = countVal1;
		transactionTypeObj[sourceType].count = transactionTypeObj[sourceType].count + 1;
	}
	for (var type in transactionTypeObj) {
		transactionTypesArr.push(transactionTypeObj[type]);
	}


	var license_details = new GlideAggregate('license_details');
	var license_count = 0;
	license_details.addEncodedQuery("name=IntegrationHub Pool", true);
	license_details.query();
	while(license_details.next()) {
		license_count = license_details.getValue('count');
	}

	return { "usage" : usage_count, "txLicense" : license_count, "transactionTypes" : transactionTypesArr};
}
