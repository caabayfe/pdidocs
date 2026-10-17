if ((current.active == true && current.operation() == 'insert') ||
    (current.active == true && current.operation() == 'delete') ||
    (current.operation() == 'update' && (current.active.changes() || current.active == true))) {
    updateDictionaryState();

    // if this a SPELLCHECK dictionary, set the related Search Profile to Draft as well
    if (current.dictionary.type == "SPELLCHECK") {
        updateRelatedProfileState();
    }
}

function updateDictionaryState() {
    var dictionaryGR = new GlideRecord('ais_dictionary');
    if (dictionaryGR.get(current.dictionary)) {
        if (dictionaryGR.state != "NEW") {
            dictionaryGR.state = 'DRAFT';
            dictionaryGR.update();
        }
    }
}

function updateRelatedProfileState() {
    // get related search profile
    var profile_id = "";
    var grM2M = new GlideRecord("ais_search_profile_ais_dictionary_m2m");
    grM2M.addQuery("dictionary", current.dictionary);
    grM2M.query();
    if (grM2M.next()) {
        profile_id = grM2M.profile;
    }

    if (profile_id != "") {
        var profileGR = new GlideRecord('ais_search_profile');
        if (profileGR.get(profile_id)) {
            if (profileGR.state != "NEW") {
                profileGR.state = 'DRAFT';
                profileGR.update();
            }
        }
    }

}
