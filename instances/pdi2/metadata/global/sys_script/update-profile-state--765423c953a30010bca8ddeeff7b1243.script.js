function abortDueToSpellcheckViolation(profileDictionaryM2MRecord) {
    gs.addErrorMessage(gs.getMessage("Operation Failed: You cannot link the dictionary \"{0}\" with the profile \"{1}\" because you can only have one spellcheck dictionary per profile, and \"{2}\" has the spellcheck dictionary \"{3}\" associated with it.", [GlideStringUtil.escapeHTML(current.dictionary.name), GlideStringUtil.escapeHTML(current.profile.name), GlideStringUtil.escapeHTML(current.profile.name), GlideStringUtil.escapeHTML(profileDictionaryM2MRecord.dictionary.name)]));
    current.setAbortAction(true);
}

function abortDueToPreExisting(profileDictionaryM2MRecord) {
    gs.addErrorMessage(gs.getMessage("Operation failed: The dictionary \"{0}\" has already been linked to the profile \"{1}\"", [GlideStringUtil.escapeHTML(current.dictionary.name), GlideStringUtil.escapeHTML(current.profile.name)]));
    current.setAbortAction(true);
}

/* 
 * Check to see if the dictionary is able to be linked
 *
 * A dictionary can be linked if:
 *
 *   1.) It is not already linked to the profile
 *   2.) It is a spellcheck dictionary, and the profile does not have a spellcheck 
 *       dictionary already associated with it
 */
if (current.operation() == 'insert') {
    var profileDictionaryM2MGR = new GlideRecord('ais_search_profile_ais_dictionary_m2m');
    profileDictionaryM2MGR.addQuery('profile', current.profile);
    profileDictionaryM2MGR.query();
    while (profileDictionaryM2MGR.next()) {
        if (current.dictionary.type === 'SPELLCHECK' && profileDictionaryM2MGR.dictionary.type === 'SPELLCHECK') {
            abortDueToSpellcheckViolation(profileDictionaryM2MGR);
        } else if (current.dictionary == profileDictionaryM2MGR.dictionary) {
            abortDueToPreExisting(profileDictionaryM2MGR);
        }
    }
}

// Everything checks out, update the profile to be in a draft state if necessary
if (!current.isActionAborted()) {
    var profileGR = new GlideRecord('ais_search_profile');
    if (profileGR.get(current.profile)) {
        if (profileGR.state != "NEW") {
            profileGR.state = 'DRAFT';
            profileGR.update();
        }
    }
}
