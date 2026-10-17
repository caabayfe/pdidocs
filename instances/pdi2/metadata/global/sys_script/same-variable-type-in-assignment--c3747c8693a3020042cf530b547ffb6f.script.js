(function executeRule(current, previous /*null when async*/) {
	// Add your code here
	var abort = true;
	if(current.guide_variable.type == 2){
		if(current.item_variable.type == 2 || current.item_variable.type == 23)
			abort = false;
	}
	else if(current.guide_variable.type == 3 || current.guide_variable.type == 5){
		if(current.item_variable.type == 3 || current.item_variable.type == 5)
			abort = false;
	}
	else if(current.guide_variable.type == 6){
		if(current.item_variable.type == 2 || current.item_variable.type == 6 || current.item_variable.type == 16 || current.item_variable.type == 23)
			abort = false;
	}
	else if(current.guide_variable.type == 16){
		if(current.item_variable.type == 2 || current.item_variable.type == 16 || current.item_variable.type == 23)
			abort = false;
	}
	else if(current.guide_variable.type == 9){
		if(current.item_variable.type == 9 || current.item_variable.type == 10)
			abort = false;
	}
	else if(current.guide_variable.type == 8){
		if(current.item_variable.type == 8 && current.guide_variable.reference == current.item_variable.reference)
			abort = false;
		else if((current.item_variable.type == 18 || current.item_variable.type == 22) && current.guide_variable.reference == current.item_variable.lookup_table)
			abort = false;
	}
	else if(current.guide_variable.type == 18){
		if(current.item_variable.type == 8 && current.guide_variable.lookup_table == current.item_variable.reference)
			abort = false;
		else if((current.item_variable.type == 18 || current.item_variable.type == 22) && current.guide_variable.lookup_table == current.item_variable.lookup_table)
			abort = false;
	}
	else if(current.guide_variable.type == 22){
		if(current.item_variable.type == 8 && current.guide_variable.lookup_table == current.item_variable.reference)
			abort = false;
		else if((current.item_variable.type == 18 || current.item_variable.type == 22) && current.guide_variable.lookup_table == current.item_variable.lookup_table)
			abort = false;
	}
	else if(current.item_variable.type == current.guide_variable.type)
		abort = false;
	if(abort == true){
		var error = gs.getMessage("'{0}' cannot be converted to '{1}'. The type or the reference is not compatible.", [current.guide_variable.question_text.toString(), current.item_variable.question_text.toString()]);
		current.setAbortAction(true);
		current.guide_variable.setError(error);
	}
})(current, previous);
