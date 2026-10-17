(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var scope = request.queryParams.scope;
	
	var dataItems = readDataItems(scope);
	
	setParametarizedFlag(dataItems);
	setTableDisplayNames(dataItems);
	
	return dataItems;
	
	function readDataItems(scope) {
		var dataItemsGR = new GlideRecord('sys_sg_data_item');
		dataItemsGR.addQuery('sys_scope', scope);
		dataItemsGR.query();

		var dataItems = [];

		while (dataItemsGR.next()) {
			dataItems.push({
				sysId: dataItemsGR.getUniqueValue(),
				name: dataItemsGR.getValue('name'),
				table: dataItemsGR.getValue('table'),
				description: dataItemsGR.getValue('description'),
				groupBy: dataItemsGR.getValue('group_by'),
				queryCondition: dataItemsGR.getValue('query_condition'),
				queryConditionScript: dataItemsGR.getValue('query_condition_script'),
				conditionType: dataItemsGR.getValue('condition_type'),
				hasParameters: false
			});
		}
		
		return dataItems;
	}
	
	function setParametarizedFlag(dataItems) {
		var dataItemIDs = dataItems.map(function(dataItem) {
			return dataItem.sysId;
		});
	
		// Set hasParameters on data items
		var allDIParamsGR = new GlideRecord('sys_sg_item_parameter');
		allDIParamsGR.addQuery('parent_table', 'sys_sg_data_item');
		allDIParamsGR.addQuery('parent', 'IN', dataItemIDs.join(','));
		allDIParamsGR.query();

		var alreadyMarked = {};
		while (allDIParamsGR.next()) {
			var dataItemId = allDIParamsGR.getValue('parent');

			if (alreadyMarked[dataItemId]) continue;
			alreadyMarked[dataItemId] = true;

			setDataItemAsParametarized(dataItems, dataItemId);
		}
	}
	
	function setDataItemAsParametarized(dataItems, dataItemId) {
		for (var i = 0; i < dataItems.length; i++) {
			if (dataItems[i].sysId == dataItemId) {
				dataItems[i].hasParameters = true;
				return;
			}
		}
	}
	
	function setTableDisplayNames(dataItems) {
		var distinctTableNamesObj = dataItems.reduce(function(obj, dataItem) {
			obj[dataItem.table] = true;
			return obj;
		}, {});
		
		var gr = new GlideRecord('sys_db_object');
		gr.addQuery('name', 'IN', Object.keys(distinctTableNamesObj).join(','));
		gr.query();
		
		while (gr.next()) {
			var name = gr.getValue('name');
			var label = gr.getValue('label');
			
			dataItems.forEach(function(dataItem) {
				if (dataItem.table == name) {
					dataItem.tableDisplayName = label;
				}
			});
		}
	}
	
})(request, response);
