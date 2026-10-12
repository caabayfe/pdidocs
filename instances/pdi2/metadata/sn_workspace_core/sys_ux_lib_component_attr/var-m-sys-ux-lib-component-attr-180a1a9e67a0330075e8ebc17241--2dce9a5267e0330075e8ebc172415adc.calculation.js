(function calculatedFieldValue(current) {
	
	if (current.pa_widget) {
		var widget = current.pa_widget.getRefRecord();
		return widget.type;
	} else if (current.report) {	
		var report = current.report.getRefRecord();
		return report.type;
	}
	
	return '';
	
})(current);
