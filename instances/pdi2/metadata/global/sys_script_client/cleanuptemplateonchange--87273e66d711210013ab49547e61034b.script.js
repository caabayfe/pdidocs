// Delete the unwanted options after the dropdowns are loaded
var cleanUpSelectElements = function() {
	var checkExist = setInterval(function() {		
		var mySelects = getSelects();
	  	if (mySelects) {		            
				 clearInterval(checkExist); // Stop checking
				 excludeOptions(mySelects);
		 	}
	}, 100); // check every 100ms
};

function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue == '') {
      return;
   }
	
	cleanUpSelectElements();
}
