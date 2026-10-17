
function updateRefQualCondition() {
	var parentSRExistCond = 'javascript:new StockRuleFilters().getStockRooms(current.model);';
	var dataToUpdate = {
		model: 'javascript:new ProcessStockRules().getRefQualCondition(current);',
		stockroom: 'javascript:new ProcessStockRules().getRefQualCondition(current);',
		parent_stockroom: 'javascript:new StockRuleFilters().getParentStockRooms(current);',
	};
	Object.keys(dataToUpdate).forEach(function(key) {
		var columnName = key;
		var conditionValue = dataToUpdate[key];
		var gr = new GlideRecord('sys_dictionary');
		gr.addQuery('name', 'alm_stock_rule');
		gr.addQuery('element', columnName);
		// Checking if customer has not added any simple condition
		gr.addNullQuery('reference_qual_condition');
		gr.query();
		if (gr.next()) {
			// Checking if existing codition is not customised by user
			if (columnName === 'parent_stockroom') {
				if (gr.getValue('reference_qual') === parentSRExistCond) {
					gr.setValue('reference_qual', conditionValue);
				}
			} else if (gs.nil(gr.getValue('reference_qual'))) {
				gr.setValue('reference_qual', conditionValue);
			}
			gr.update();
		}
	});
}
updateRefQualCondition();
