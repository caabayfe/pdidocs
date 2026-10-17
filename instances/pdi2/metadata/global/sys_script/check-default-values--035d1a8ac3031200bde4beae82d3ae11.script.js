(function executeRule(current, previous /*null when async*/) {
	
	var excludedItems = current.exclusion_choice_list.toString();
	var defaultValues = current.default_choice.toString();
	var excludedItemsArray = excludedItems.split(",");
	var defaultValuesArray = defaultValues.split(",");
	var hasOverlap = false;
	
	for(var i=0;i<defaultValuesArray.length;i++){
		if(excludedItemsArray.indexOf(defaultValuesArray[i]) > -1){
			hasOverlap =true;
		}
	}
	
	if(hasOverlap){
		gs.addErrorMessage(gs.getMessage("Default values contains excluded items"));
		current.setAbortAction(true);
	}
	
	
	
})(current, previous);
