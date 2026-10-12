if (current.results_per_page < 1){
	current.results_per_page.setError(gs.getMessage("Results per page cannot be less than one"));
	current.setAbortAction(true);
} else if (current.search_app && (current.results_per_page > current.search_app.search_results_limit)) {
	current.results_per_page.setError(gs.getMessage("Results per page cannot be greater than Search Results Limit"));
	current.setAbortAction(true);
}
