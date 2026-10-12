blacklistSuggestions();

/**
 * Remove all suggestions that:
 * 1. contain any words that match the inserted excluded phrase if phrase is a word;
 * 2. match the regex pattern if phrase is regex.
 */
function blacklistSuggestions(){
	var svc = new SearchSuggestionService();
	svc.blacklistSuggestions(current.phrase, current.language);
}
