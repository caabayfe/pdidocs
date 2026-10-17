(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
	function getColumns(table) {
		var td = new GlideTableDescriptor(table);
		var sch = td.getSchema();
		var columns = [];
		for(var i = 0 ; i < sch.size(); i++){
			var key = sch.keySet().toArray()[i];
			columns.push(getColumn(table, key));
		}
		
		return columns;
	}
	
	function getColumn(table, column) {
		var columns = [];
		var td = new GlideTableDescriptor(table);
		
		var ed =  td.getElementDescriptor(column);
		return {
			name: ed.getName(),
			label: ed.getLabel(),
			type: ed.getInternalType(),
			reference: ed.getReference()
		};
	}
	
	function getFieldDotwalk(field, table){
		var isDotWalkColumn = field && field.split('.').length > 1;
		if(!isDotWalkColumn) {
			return null;
		}
		var columnsNames = field.split('.');
		var dotWalk = [];
		
		column = getColumn(table, columnsNames[0]);
		dotWalk.push(column);
		
		for (var i = 1; i < columnsNames.length; i++) {
			table = column.reference;
			column = getColumn(table, columnsNames[i]);
			if(column.reference && i < columnsNames.length-1){
				dotWalk.push(column);
			}
			
		}
		return dotWalk;
	}
	
	var column;
	var dotWalks = {};
		var table = request.queryParams.table.toString();
		var fields = request.queryParams.fields.toString().split(',');
		var fieldsReference = request.queryParams.fields_reference.toString();
		for (var i = 0; i < fields.length; i++) {
			var field = fields[i];
			dotWalk = getFieldDotwalk(field, table);
			
			if(dotWalk){
				dotWalks[field] = dotWalk;
			}
		}
		
		var columns = [];
		if(dotWalks[fieldsReference]){
			var length = dotWalks[fieldsReference].length-1;
			var reference =  dotWalks[fieldsReference][length].reference;
			columns = getColumns(reference);
			if(columns){
				columns = columns.sort(function(col1, col2) {
					return col1.label.localeCompare(col2.label);
				});
			}
		} else {
			columns = getColumns(table);
		}
		return { dotWalks: dotWalks, fields:columns };
			
		})(request, response);
