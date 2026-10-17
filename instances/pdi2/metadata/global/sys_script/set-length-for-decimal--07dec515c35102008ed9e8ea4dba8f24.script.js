(function executeRule(current, previous /*null when async*/ ) {
      
      // Add your code here
	var ml = current.max_length;
	if (ml < 15) 
		current.max_length = 15;
	
 })(current, previous);
