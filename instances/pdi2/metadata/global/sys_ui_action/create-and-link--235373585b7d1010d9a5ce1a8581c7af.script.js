var tabLabelToDictionaryTypeMap = {
    "Synonyms": "SYNONYM",
    "Stop Words": "STOPWORD",
    "Typo Handling": "SPELLCHECK"
};

var labelProperty = RP.getParameterValue('sysparm_collection_label');
var dictionaryType = tabLabelToDictionaryTypeMap[labelProperty];

var profileSysID = action.getGlideURI().get('sysparm_collectionID');

var spellcheckDictionaryExists = false;
var dictionaryToProfileGR = new GlideRecord('ais_search_profile_ais_dictionary_m2m');
dictionaryToProfileGR.addQuery('profile', profileSysID);
dictionaryToProfileGR.query();
while (dictionaryToProfileGR.next()) {
    if (dictionaryToProfileGR.dictionary.type == 'SPELLCHECK') {
        spellcheckDictionaryExists = true;
    }
}

var profileRecord = new GlideRecord('ais_search_profile');
profileRecord.get(profileSysID);
var label = profileRecord.label;

/* Go to the M2M page to link a dictionary to this profile */
action.setRedirectURL('ais_dictionary.do?type=' + dictionaryType + '&profile=' + profileSysID + '&profile_name=' + label + '&allow_spellcheck=' + !spellcheckDictionaryExists);

/* Return to this profile form when done */
var profileGR = new GlideRecord("ais_search_profile");
profileGR.get(profileSysID);
action.setReturnURL(profileGR);
