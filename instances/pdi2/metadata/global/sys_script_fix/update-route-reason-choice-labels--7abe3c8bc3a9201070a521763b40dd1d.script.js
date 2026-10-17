(function() {
	
		// Get all targeted sys_choice entries
		var choiceValues = new GlideRecord("sys_choice");
		choiceValues.addQuery("element", "route_reason");
		choiceValues.query();

		while(choiceValues.next()) {
			var tmpChoice = choiceValues.label;
			if(tmpChoice && tmpChoice.includes("Route"))
				{
					choiceValues.label = tmpChoice.replace("Route","Transfer");
					choiceValues.update();
				}
			
		}

})();
