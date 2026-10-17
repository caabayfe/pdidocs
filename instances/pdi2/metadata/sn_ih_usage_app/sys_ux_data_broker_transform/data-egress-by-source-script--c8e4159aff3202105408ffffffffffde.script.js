function transform(input) {
	var trendDataObj = {};
	var sourceArr = [];
	var dateFilterConditon = input.dateFilterCondition || "sys_created_onBETWEENjavascript:gs.beginningOfLast12Months()@javascript:gs.endOfYesterday()";
	var ga = new GlideAggregate("data_egress_count");
	ga.addEncodedQuery(dateFilterConditon, true);
	ga.query();
	while(ga.next()) {
		var sourceType = ga.getValue('source');
		if (!trendDataObj[sourceType]) {
			trendDataObj[sourceType] = {
                     "sum" : 0,
                     "groupBy" : [{
                          "displayValue" : sourceType,
                          "value" : sourceType,
                          "field" : "source" 

                     }]};
		}
		var trendVal = ga.getValue('aggregation_value');
		trendVal = trendDataObj[sourceType].sum + parseInt(trendVal);
		trendDataObj[sourceType].sum = trendVal;
	}
	for (var type in trendDataObj) {
		sourceArr.push(trendDataObj[type]);
	}
	return {"dataEgressBySource" : sourceArr};
}
