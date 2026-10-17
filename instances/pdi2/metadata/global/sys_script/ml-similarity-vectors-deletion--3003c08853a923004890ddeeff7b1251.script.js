(function executeRule(current, previous /*null when async*/) {
	
	/* PRB1311739: Cascade Delete for ML Solution Definition/ML Solution
	   This business rule will be excuted whenever a ML Solution is deleted which can happen in case of a deletion of Ml Solution Definition or by directly deleting a solution through UI. */
	
	
	// Deleting records from ML Solution Vectors when a solution is deleted, fetching all records corresponding to solution_id and deleting them.
	var solutionVectors = GlideRecord("ml_solution_vectors");
	if (solutionVectors.isValid()) {
		solutionVectors.addQuery("solution_id", current.sys_id);
		solutionVectors.deleteMultiple();
	}	
		
})(current, previous);
