(function calculatedFieldValue(current) {
	var msg = gs.getMessage('NOTE: Apply only 1 Report widget or 1 PA Widget. If both fields are filled, only the report will be shown.');
	if (current.pa_widget) {
		var widget = current.pa_widget.getRefRecord();
		
		if (widget.type == 'score') {
			return msg + '\n' + gs.getMessage('The Performance Analytics Score is of type {0}', widget.template);
		}
	}	
	return msg;

})(current);
