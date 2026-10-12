validateMinMax();

function validateMinMax() {
	var datatype = current.datatype;
	
	if (datatype == 'custom' && current.custom_metric.result_type == 'string')
		return;

	if (datatype == 'boolean' || datatype == 'checkbox') {
		current.min = 0;
		current.max = 1;
		return;
	}
	
	if (current.min < 0) {
		var infoMsg = gs.getMessage("The minimum value must be greater than or equal to 0");
		gs.addInfoMessage(infoMsg);
		current.setAbortAction(true);
	}

	var infoMsg = "";
	if (datatype == 'choice' || datatype == 'scale' || datatype == 'numericscale' || datatype == 'imagescale' || datatype == 'template') {
		if (current.min > current.max) {
			infoMsg = gs.getMessage("The minimum value must be less than or equal to the maximum value");
			gs.addInfoMessage(infoMsg);
			current.setAbortAction(true);
		}
	} else if (current.min >= current.max) {
		infoMsg = gs.getMessage("The minimum value must be less than the maximum value");
		gs.addInfoMessage(infoMsg);
		current.setAbortAction(true);
	}
}
