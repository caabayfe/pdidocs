(function executeRule(current, previous /*null when async*/) {
	var val = current.value.replaceAll(' ','');
	var SIZE = 'cmdb_ci_endpoint'.length;
	var index = val.indexOf('cmdb_ci_endpoint');
	var toAbort = false;
	
	if(index < 0){
		toAbort = true;
	}
	else{
		//case is first in list, verify next char is ','
		if(index === 0){
			if(val.charAt(SIZE) !== ','){
				toAbort = true;
			}
		}
		else{
			//case is last in list, verify prev char is ','
			if(index === val.length-SIZE){
				if(val.charAt(index-1) !== ','){
					toAbort = true;
				}
			}
			//case is in the middle of the list - verify before and after ','
			else{
				if(val.charAt(index-1) !== ',' || val.charAt(index+SIZE) !== ','){
					toAbort = true;

				}
			}
		}
	}
	if (toAbort){
		gs.addErrorMessage(gs.getMessage("Manual service CI type exclusion list must include 'cmdb_ci_endpoint'."));
		current.setAbortAction(true);
	}

})(current, previous);
