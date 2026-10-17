(function() {

var id = new SNC.IndexSuggestionAPI().suggestIndex(current);
if (id != null) {
	var suggestion = new GlideRecord("sys_index_suggestion");
	suggestion.get(id);
	action.setRedirectURL(suggestion);
} else {
	action.setRedirectURL(current);
}

})();
