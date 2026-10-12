function transform(input) {
	var best_practices = {
		"totalCount" : 0,
		"filteredPractices" : []
	};
	var bestPracticesGr = new GlideRecord("sn_vsc_best_practice_configurations");
	var encodedQueries = new sn_vsc.SecurityCenterConstants().bestPracticesEncodedQueries;
	bestPracticesGr.addEncodedQuery(encodedQueries["getAllActiveNotRemovedRecords"]);
	bestPracticesGr.query();
	best_practices["totalCount"] = bestPracticesGr.getRowCount();
        /**
    	  * All the business logic to pull in the filtered ( if any from the homepage ) list of all the best practices
    	  * 
	*/
	// We need to put the filter from the input param and glide query it for the following ( only when we will pick up grid view )
	// bestPracticeObj.query(); // Filter from input param when grid is on
	var filteredList = [];
	while (bestPracticesGr.next()) {
		// This object will grow as soon as the grid view is implemented
		var bestPracticeObj = {};
		bestPracticeObj["name"] = bestPracticesGr.getDisplayValue("name").toString();
		bestPracticeObj["maturity_level"] = bestPracticesGr.getDisplayValue("maturity_level").toString();
		filteredList.push(bestPracticeObj);
	}
	best_practices["filteredPractices"] = filteredList;
	return best_practices;
}
