(function executeRule(current, previous /*null when async*/) {

	var isValid = true;
	var exceedsMsg = gs.getMessage('Maximum row limit defined for {0} attribute exceeds the instance level limit', ['max_rows']);
	var invalidMsg = gs.getMessage('Invalid value set for {0} attribute', ['max_rows']);

	var attrs = current.getValue('set_attributes');
	var attrsTokens = attrs.split(',');

	for (var i=0; i<attrsTokens.length; i++) {
		var attrsToken = attrsTokens[i];
		var values = attrsToken.split('=');
		if (values.length == 2 && values[0] == 'max_rows') {
			var limit = Number(values[1]);
			if (isNaN(limit) || limit <= 0) {
				isValid = false;
				break;
			} else {
				var globalPropertyVal = gs.getProperty('glide.sc.multirow_set.rows.size', '50');
				if (limit >= globalPropertyVal) {
					gs.addErrorMessage(exceedsMsg);
					current.setAbortAction(true);
					return;
				}
			}
		}
	}

	if(!isValid) {
		gs.addErrorMessage(invalidMsg);
		current.setAbortAction(true);
	}

})(current, previous);
