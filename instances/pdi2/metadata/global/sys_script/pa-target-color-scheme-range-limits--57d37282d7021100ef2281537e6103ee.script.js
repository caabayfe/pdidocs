checkLimits();

function checkLimits(){
	var errorMessage;
	if (current.range_from_2 <= current.range_from_1)
		errorMessage = "Range limit 2 must be higher than Range limit 1";
	if (current.range_from_3 <= current.range_from_2)
		errorMessage = "Range limit 3 must be higher than Range limit 2";
	if (current.range_from_4 <= current.range_from_3)
		errorMessage = "Range limit 4 must be higher than Range limit 3";

	if (errorMessage != undefined){
		current.setAbortAction(true);
    	gs.addErrorMessage(gs.getMessage(errorMessage));
    }

}
