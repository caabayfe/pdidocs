(function executeRule(current, previous /*null when async*/) {

    var grM2M = new GlideRecord('ais_search_profile_ais_dictionary_m2m');
    grM2M.addQuery('profile', current.getUniqueValue());
    grM2M.addQuery('dictionary.name', 'ENDSWITH', '_default_spell_check_dictionary');
    grM2M.query();
    if (grM2M.next()) {
        var grDict = new GlideRecord('ais_dictionary');
        if (grDict.get(grM2M.getValue('dictionary'))) {
            if (grDict.getValue('state') != 'NEW') {
                new sn_ais.Synchronizer().deleteDictionary(grDict.getValue('name'));
            }
            grDict.setWorkflow(false);
            grDict.deleteRecord();
        }
    }

    // Unlink remaining dictionaries
    grM2M = new GlideRecord('ais_search_profile_ais_dictionary_m2m');
    grM2M.addQuery('profile', current.getUniqueValue());
    grM2M.query();
    while (grM2M.next()) {
        grM2M.setWorkflow(false);
        grM2M.deleteRecord();
	}

})(current, previous);
