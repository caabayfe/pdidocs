var profileSysID = action.getGlideURI().get('sysparm_collectionID');

/* Go to the form to create a new Genius Result */
action.setRedirectURL('ais_genius_result_configuration.do?profile=' + profileSysID);

/* Return to this profile form when done */
var profileGR = new GlideRecord("ais_search_profile");
profileGR.get(profileSysID);
action.setReturnURL(profileGR);
