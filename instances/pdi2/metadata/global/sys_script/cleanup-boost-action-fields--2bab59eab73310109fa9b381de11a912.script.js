(function executeRule(current, previous /*null when async*/) {
	var errorMessage;

	if (current.boost_type == "indexed_source") {
		current.boost_value = null;
		current.boost_context_field = null;
		current.boost_field_name = null;
	} else if (current.boost_type == "user_context") {
		current.boost_value = null;
		if (gs.nil(current.boost_context_field)) {
			errorMessage = "Matches the Searcher's is mandatory for Boost By User Context (dynamic) actions";
		} else if (current.boost_context_field == "dot_walked_field" && gs.nil(current.user_dotwalked_field)) {
			errorMessage = "Matches User Dot-walked Field is mandatory when using Other User Dot-walked Field";
		}
	} else if (current.boost_type == "field_boost") {
		current.boost_context_field = null;
		if (gs.nil(current.boost_value)) {
			errorMessage = "Contains is mandatory for Boost By Field Match (static) actions";
		}
	} else if (current.boost_type == "synonym_boost") {
		if (gs.nil(current.synonym_dictionaries)) {
			errorMessage = "Matches A Synonym Dictionary is mandatory for Boost By Synonym Dictionary actions";
		}
	}

	if (errorMessage) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage(errorMessage));
	}

})(current, previous);
