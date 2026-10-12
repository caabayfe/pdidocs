(function calculatedFieldValue(current) {

	var viewName = !current.view.nil() ? current.view.title : '';
	var tableName = !current.name.nil() ? current.name.toString() : '';
	var tableLabel = tableName;
	if(tableName) {
		var gr = new GlideRecord(tableName);
		tableLabel = gr.isValid() ? gr.getLabel() : tableLabel;
	}
	return tableLabel + ' - ' + viewName; 

})(current);
