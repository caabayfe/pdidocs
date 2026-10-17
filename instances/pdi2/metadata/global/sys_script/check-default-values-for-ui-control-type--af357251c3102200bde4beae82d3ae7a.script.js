(function executeRule(current, previous /*null when async*/) {

	var uiControlType = current.ui_control_type.toString();
	var CHOICELIST = 1, REFERENCE = 2, DATE = 3, GROUP = 4, BOOLEAN = 5;
	var RADIO = '1', CHECKBOX = "3", SINGLE_SELECT = '2', MULTI_SELECT = "4";


	var defaultValues = "";
	
	if (current.type == CHOICELIST) {
		defaultValues = current.default_choice
	} else if (current.type == REFERENCE) {
		defaultValues = current.default_reference_field_value;
	}
	else if (current.type == DATE) {
		defaultValues = current.default_date_filter;
	}
	else if (current.type == BOOLEAN) {
		defaultValues = current.default_boolean_field;
	}
	
	var defaultValuesArray = defaultValues.split(",");
	var defaultValuesLength = defaultValuesArray.length;

	if (defaultValuesLength > 1 && (uiControlType === RADIO || uiControlType === SINGLE_SELECT)) {
		gs.addErrorMessage(gs.getMessage("Selected UI Control type allows only one default value"));
		current.setAbortAction(true);
	}


})(current, previous);
