(function executeRule(current, previous /*null when async*/) {

	if (current.dictionary_reference_qualifier == "STOPWORD") {
        // look up all mapped dictionaries to profile
        var m2mRecords = new GlideRecord("ais_search_profile_ais_dictionary_m2m");
        m2mRecords.addQuery("profile", current.profile);
        m2mRecords.query();
        var dictionaryIds = [];
        while (m2mRecords.next()) {
            dictionaryIds.push(m2mRecords.getValue("dictionary"));
        }

        // loop through the mapped dictionaries and collect locales of stop word dictionaries
        var dictionaryRecords = new GlideRecord("ais_dictionary");
        dictionaryRecords.addEncodedQuery("sys_idIN" + dictionaryIds.join(), true);
        dictionaryRecords.addQuery("type", "STOPWORD");
        dictionaryRecords.query();
        var dictionaryLocales = [];
        while (dictionaryRecords.next()) {
            dictionaryLocales.push(dictionaryRecords.getValue("locale"));
        }
		
		if (dictionaryLocales.join().contains(current.dictionary.locale)) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage("There is already a Stop Words dictionary for the selected language. You are only allowed one Stop Words dictionary per language"));
		}

	}

})(current, previous);
