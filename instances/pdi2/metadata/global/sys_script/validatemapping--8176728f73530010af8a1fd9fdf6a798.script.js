(function executeRule(current, previous /*null when async*/ ) {
    var mapToSuggestedColumn = function() {
		try {
			var resultStr = SNC.MultiSourceScriptableApi.getSuggestedColumnMapping(current.table, current.field, current.ms_table_field);
			var resultObj = JSON.parse(resultStr);
			
			if (!resultObj || !resultObj.ColumnName) {
				current.setAbortAction(true);
				gs.addErrorMessage(gs.getMessage('Creating column mapping failed. No unused columns found'));
				return;
			}
			
			if (!resultObj.IsExisting || resultObj.IsExisting === 'false') {		
				current.ms_table_field = resultObj.ColumnName;
				current.table = resultObj.TableName;
				var msg = new Array();
				msg.push(current.table);
				msg.push(current.field);
				msg.push(current.ms_table_field);
				gs.addInfoMessage(gs.getMessage('Column {2} in CMDB Multisource table is mapped to {0}\'s {1} column', msg));
			} else {
				current.setAbortAction(true);
				var msg2 = new Array();
				msg2.push(resultObj.TableName);
				msg2.push(resultObj.ColumnName);
				gs.addErrorMessage(gs.getMessage('Mapping already exists for table : {0} column: {1}', msg2));
				return;
			}
		
		} catch (ex) {
			current.setAbortAction(true);
			var msg3 = ex.getMessage();
			gs.addErrorMessage(gs.getMessage('Creating column mapping failed: {0}', msg3));
		}
	};

	mapToSuggestedColumn();
})(current, previous);
