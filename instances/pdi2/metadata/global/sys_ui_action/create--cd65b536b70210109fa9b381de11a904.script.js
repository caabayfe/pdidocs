var profileSysID = action.getGlideURI().get('sysparm_collectionID');

/* Go to the form to create a new Improvement Rule Result */
action.setRedirectURL('ais_rule.do?sys_id=-1&sysparm_query=profile=' + profileSysID);

/* Return to this profile form when done */
var profileGR = new GlideRecord("ais_search_profile");
profileGR.get(profileSysID);
action.setReturnURL(profileGR);
