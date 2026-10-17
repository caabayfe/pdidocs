function transform(input) {

		try {
			var custom_translation = gs.getMessage("Number of actions");
			custom_translation = gs.getMessage("Number of actions over time");
			custom_translation = gs.getMessage("Number of users who used Gen AI actions per day");
			custom_translation = gs.getMessage("Gen AI Actions per day");
			custom_translation = gs.getMessage("Avg number of unique users per day who triggered actions");
			custom_translation = gs.getMessage("The total number of actions completed using Now Assist in the date range selected");
			custom_translation = gs.getMessage("Active Skills performance");
			custom_translation = gs.getMessage("Gen AI Avg response time per day");
			custom_translation = gs.getMessage("Number of Generative AI Calls");
			custom_translation = gs.getMessage("Number of unique users per day");
			custom_translation = gs.getMessage("Average task completion time per day");
			custom_translation = gs.getMessage("Task completion over time");
			custom_translation = gs.getMessage("Total no. of tasks completed");
			custom_translation = gs.getMessage("Avg. unique users per day who used skills");
			custom_translation = gs.getMessage("The average number of unique users per day who used Now Assist skills");
			custom_translation = gs.getMessage("The total number of tasks completed using Now Assist in the date range selected");
			custom_translation = gs.getMessage("The number of tasks completed using Now Assist per day over a selected date range");
			custom_translation = gs.getMessage("The average amount of time it takes for a task to be completed per day");
			custom_translation = gs.getMessage("Skill usage");

			return custom_translation;
		}

		
		catch (e) {
            gs.error('Error occured in translations');
        return [];
      }
}
