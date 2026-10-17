(function executeRule(current, previous /* null when async */) {
	var currentName = current.getValue('name');
	var currentDataItem = current.getValue('data_item');
	var dataItemTableName = current.data_item.table;
	gr = new GlideRecord('sys_sg_function');
	gr.addQuery('name', currentName);
	gr.addQuery('data_item', currentDataItem);
	gr.query();
	if (gr.getRowCount() > 0 && gr.next() && gr.getUniqueValue() != current.getUniqueValue()) {
		gs.addInfoMessage(gs.getMessage('Name field must be unique'));
		current.setAbortAction(true);
	}

	if (GlideTableDescriptor.fieldExists(dataItemTableName, currentName)) {
	    var infoMessage = gs.getMessage('Field with name {0} already exist in data item table {1}', [currentName, dataItemTableName]);
		gs.addInfoMessage(infoMessage);
		current.setAbortAction(true);
	}
})(current, previous);
