(function executeRule(current, previous /*null when async*/) {
	if(!current.table.nil())
		{ 
			current.record=true; 
		}
		else { 
			current.record=false; 
		}
			
		})(current, previous);
