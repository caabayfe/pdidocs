var profileSysID = action.getGlideURI().get('sysparm_collectionID');

var relationToDictionaryTypeMap = {
    "d40223ce5b211010d9a5ce1a8581c750": "SYNONYM",
    "ecf8c4225be11010d9a5ce1a8581c77b": "STOPWORD",
    "cfcb379a5ba11010d9a5ce1a8581c766": "SPELLCHECK"
};

var relation = RP.getParameterValue('sysparm_collection_relationship');
var dictionaryType = relationToDictionaryTypeMap[relation];

/* Go to the M2M page to link a dictionary to this profile */
action.setRedirectURL('ais_search_profile_ais_dictionary_m2m.do?sys_id=-1&sysparm_query=profile=' + profileSysID + '^dictionary_reference_qualifier=' + dictionaryType);

/* Return to this profile form when done */
var profileGR = new GlideRecord("ais_search_profile");
profileGR.get(profileSysID);
action.setReturnURL(profileGR);
