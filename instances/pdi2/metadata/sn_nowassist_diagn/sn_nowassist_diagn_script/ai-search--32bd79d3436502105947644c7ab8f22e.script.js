diagnose();

function diagnose() {
	var messages = [];
	var inputs = {"search_term":"ipad","logging_context":"{}","start_time":1683779834727,"context_profile_id":"3a33973653211010a813ddeeff7b125a","search_context_id":"ac5e379f1b8e61103341a9b9ab4bcba2","locale":"en"}; 

	var searchResult = JSON.parse(sn_cs.VASystemObject.retrieveSearchResults(inputs.search_term, inputs.context_profile_id, inputs.search_context_id, inputs.logging_context, inputs.locale, "")); 

	if (searchResult.result[0].status != 200) {
		messages.push(new DiagnosticMessage("Unexpected status returned by AI Search: " + searchResult.status, "Check AI Search server status"));
	}
	if (searchResult.result[0].errors && searchResult.result[0].errors.length != 0) {
		messages.push(new DiagnosticMessage("Errors returned by AI search: " + JSON.stringify(searchResult.result[0].errors), "Check error messages"));
	}
	if (!searchResult.result[0].executionResult.searchResultsTemplates || searchResult.result[0].executionResult.searchResultsTemplates.length == 0) {
		messages.push(new DiagnosticMessage("No results were returned", "Possibly no matching result for search term 'ipad', or an issue with AI Search"));
	}
	
	return messages;
}
