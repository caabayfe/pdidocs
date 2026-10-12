(function executeRule(current, previous /*null when async*/) {
	if (JSUtil.nil(current.table)) {
		return;
	}
	//TODO_NLU: Temporarily disabling check for NLU trainer and Relevancy
	var capability = current.capability.getRefRecord().getValue("value");
	if(capability == 'nlu_trainer' || capability == 'search_relevancy_trainer'){
		return;
	}
    
    var validation = true;
    var addedInputFields = getAddedInputFields(current, previous);
    var FieldvalidationObj = new global.MlValidationHelper().checkInputTypes(current.table, current.capability.getRefRecord().getValue("value"), addedInputFields);

    if (!FieldvalidationObj.validation) {
        validation = false;
        FieldvalidationObj.errorMsg ? gs.addErrorMessage(FieldvalidationObj.errorMsg) : "";
    }

    // min/max rows validation for api created solutions
    // have to be performed at the scriptable object level
    // because min row count can be overriden using api
    if (!(JSUtil.areEqual(current.getValue("request_source"), "api") && (JSUtil.areEqual(current.getValue("triggered_source"), "API") || JSUtil.areEqual(current.getValue("triggered_source"), "api")))) {
	var validationObj = new global.MlValidationHelper().minmaxValidation(current.table, current.filter, current.capability.getRefRecord().getValue("value"));
	
    if (!validationObj.validation) {
        validation = false;
		validationObj.errorMsg ? gs.addErrorMessage(validationObj.errorMsg) : "";
    }
    }
    if (!validation) {
        current.setAbortAction(true);
    }

})(current, previous);
	
function getAddedInputFields(current, previous) {
    var currentArray = current.fields.split(',');

    if (gs.nil(previous.fields)) {
        return currentArray;
    }
    var previousArray = previous.fields.split(',');
    return currentArray.filter(function(x) {
        return previousArray.indexOf(x) < 0;
    });
}
