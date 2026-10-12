(function executeRule(current, previous /*null when async*/ ) {
    var profileID = RP.getParameterValue('profile');
    g_scratchpad.ais_profile_id = profileID;
    g_scratchpad.dictionary_type = RP.getParameterValue('type');
    g_scratchpad.allow_spellcheck = RP.getParameterValue('allow_spellcheck') == 'true';
    g_scratchpad.ais_profile_name = RP.getParameterValue('profile_name');

    if (g_scratchpad.dictionary_type == "STOPWORD") {
        // look up all mapped dictionaries to profile
        var m2mRecords = new GlideRecord("ais_search_profile_ais_dictionary_m2m");
        m2mRecords.addQuery("profile", profileID);
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

        g_scratchpad.dictionaryLocales = dictionaryLocales.join();
    }

})(current, previous);
