var profileSysID = action.getGlideURI().get('sysparm_collectionID');

gs.getSession().putClientData('profile_for_search_source', profileSysID);

/* Go to the form to create a new Genius Result */
action.setRedirectURL('ais_search_source.do?profile=' + profileSysID);

/* Return to this profile form when done */
var profileGR = new GlideRecord("ais_search_profile");
profileGR.get(profileSysID);
action.setReturnURL(profileGR);
