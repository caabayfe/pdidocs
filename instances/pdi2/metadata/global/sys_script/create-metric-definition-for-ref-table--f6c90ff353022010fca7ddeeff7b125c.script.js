(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var def = new GlideRecord('asmt_metric_definition');
	
	def.addQuery('metric', current.getUniqueValue());
	def.query();
	
	def.deleteMultiple();
	
	if (!gs.nil(current.reference_table)) {
		var order = 10;
		var rowCount = 0;
		var tab = new GlideRecord(current.reference_table);
		tab.addEncodedQuery(current.condition, true);
		tab.query();
		
		rowCount = tab.getRowCount();
		
		if (rowCount === 0)
			gs.addInfoMessage(gs.getMessage("There is no record in the selected table"));
		else
			gs.addInfoMessage(gs.getMessage("{0} metric definitions are being generated for the selected table", rowCount));
		
		while(tab.next()){
			def.initialize();
			def.setValue('display', tab.getDisplayValue());
			def.setValue('metric', current.getUniqueValue());
			def.setValue('value', order);
			def.setValue('normalization_input', order);
			def.setValue('order', order);
			def.insert();
			
			order += 10;
		}
	}
	
})(current, previous);
