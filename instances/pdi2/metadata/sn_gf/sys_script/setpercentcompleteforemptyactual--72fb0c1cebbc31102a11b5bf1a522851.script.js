(function executeRule(current, previous /*null when async*/) {

    var isQuantitativeActualValueCleared = previous.actual_value!="" && current.actual_value.changesTo("") ;
	var isQualitativeActualValueCleared = previous.qualitative_actual_value!="" && current.qualitative_actual_value.changesTo("");
	var isRecordCopiedWithActualCleared = current.operation() == "insert" && current.actual_value == "" && current.qualitative_actual_value=="";
		
	if(isQuantitativeActualValueCleared || isQualitativeActualValueCleared || isRecordCopiedWithActualCleared)
		current.percent_complete = "";
	

})(current, previous);
