(function executeRule(current, previous /*null when async*/) {
	var abortTransaction = false;
	
	if(current.attrs.primary_fields == "") {
		gs.addErrorMessage(gs.getMessage("Please provide Primary fields"));
		abortTransaction = true;
	}
	
	if(current.attrs.secondary_user != "" && current.attrs.secondary_fields == "") {
		gs.addErrorMessage(gs.getMessage("Please provide Secondary fields"));
		abortTransaction = true;
	}
	
	function hasTwoLevelDotWalking(field) {
		var count = field.split(".").length;
		if (count > 2) {
			return true;
		}
		return false;
	}
	var primaryDotOK = true;
	var secondaryDotOK = true;
	if (typeof current.attrs.primary_fields != 'undefined') {
		var primaryArr = current.attrs.primary_fields.split(",");
		for (var i = 0; i < primaryArr.length; i++) {
			if (hasTwoLevelDotWalking(primaryArr[i])) {
				primaryDotOK = false;
				break;
			}
		}
	}
	if (typeof current.attrs.secondary_fields != 'undefined') {
		var secondaryArr = current.attrs.secondary_fields.split(",");
		for (var j = 0; j < secondaryArr.length; j++) {
			if (hasTwoLevelDotWalking(secondaryArr[j])) {
				secondaryDotOK = false;
				break;
			}
		}
	}
	if (!primaryDotOK || !secondaryDotOK) {
		gs.addErrorMessage(gs.getMessage("Primary fields and secondary fields support one level of dot-walking"));
		abortTransaction = true;
	}
	
	if(abortTransaction == true) {
		current.setAbortAction(true);
	}

})(current, previous);
