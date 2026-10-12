(function executeRule(current, previous /*null when async*/) {

	//For new inserts, always create the common fields at the very least
	//Updates need not do anything if the return_fields is unchanged
	if (current.operation() == 'insert' || current.return_fields.changes()) {
		var fields = current.getValue('return_fields') || '';
		var fieldsArray = fields ? fields.split(',') : [];

		var aisGeniusConfigId = current.getUniqueValue();
		var name = current.getValue('name');

		var geniusResultModelService = new GeniusResultModelService(aisGeniusConfigId);
		
		if (!geniusResultModelService.hasModel()) {
			geniusResultModelService.createModel(name);
		}
		
		geniusResultModelService.syncFields(fieldsArray);
	}
})(current, previous);
