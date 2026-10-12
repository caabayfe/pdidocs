if (current.results_per_page < 1){
	current.results_per_page.setError(gs.getMessage("Results per page cannot be less than one"));
	current.setAbortAction(true);
} else if (current.limit != "" && current.results_per_page > current.limit) {
	current.results_per_page.setError(gs.getMessage("Results per page cannot be greater than Limit"));
	current.setAbortAction(true);
}
