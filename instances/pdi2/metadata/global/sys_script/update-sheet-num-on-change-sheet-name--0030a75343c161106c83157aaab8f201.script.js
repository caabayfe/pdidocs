(function executeRule(current, previous /*null when async*/) {
	
		if(previous.sheet_number==0 && previous.sheet_name==0){
		if(current.sheet_number==0){
			current.sheet_number = current.sheet_name;
		}else{
			current.sheet_name = current.sheet_number;
		}
	}else{
		if(previous.sheet_name!=current.sheet_name){
			current.sheet_number = current.sheet_name;
		}else if(previous.sheet_number!=current.sheet_number){
			current.sheet_name = current.sheet_number;
		}
	}

})(current, previous);
