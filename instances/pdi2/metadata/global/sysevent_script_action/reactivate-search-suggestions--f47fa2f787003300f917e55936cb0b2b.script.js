reactivateSuggestions();

/**
 * Reactivate suggestions previously excluded by phrase and language.
 */
function reactivateSuggestions(){
	var sysId = event.parm1;

	var svc = new SearchSuggestionService();
	svc.reactivateSuggestions(sysId);
}
