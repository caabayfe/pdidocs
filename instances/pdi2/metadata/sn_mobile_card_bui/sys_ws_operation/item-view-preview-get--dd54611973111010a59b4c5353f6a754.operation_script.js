(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var itemViewSysId = request.queryParams.sys_id[0];
	var fieldsToQuery = [];


	function getContentInTheParenthesis(str){
		var startingIndex = str.indexOf('(');
		return startingIndex > -1
			? str.substring(startingIndex + 1, str.length - 1)
			: str;
	}

	function determineFields(dependencyFields) {
		var allFields = dependencyFields.split(',');
		var formattedFields = allFields.map(function(field) {
			var fieldStr = field.split('-')[0];
			return getContentInTheParenthesis(fieldStr);
		});
		return formattedFields;
	}

		function getColumns(table) {
		if(!table) return [];
		var td = new GlideRecordSecure(table);
		var elems = td.getElements();
		var columns = {};
		for(var i = 0 ; i < elems.length; i++){
			var elem = elems[i];
			var name = elem.getName();
			var label = elem.getLabel();
			columns[name] = {
				name: name,
				label: label
			};
		}

		return columns;
	}



	var itemViewGR = new GlideRecordSecure('sys_sg_item_view');
	itemViewGR.get(itemViewSysId);

	var table = itemViewGR.getValue('table');
	var dependencyFields = itemViewGR.getValue('dependency_fields');
	var formattedDependencyFields = determineFields(dependencyFields);

	var tableSchema = getColumns(table);

 	if(request.body.data.dependency_fields.length) {
		fieldsToQuery = request.body.data.dependency_fields;
 	} else {
		formattedDependencyFields.forEach(function(field) {
			fieldsToQuery.push(field);
		});
 	}

	var result = [];

	var tableGR = new GlideRecordSecure(table);
	tableGR.setLimit(1000);
	tableGR.query();

	while(tableGR.next()) {
		var previewElement = {};
		fieldsToQuery.forEach(function(field){
			if (field) {
				previewElement[field] = tableGR.getElement(field).getDisplayValue() + "";
			}
		});
		result.push(previewElement);
	}





    return { previewData: result, tableSchema: tableSchema };

})(request, response);
