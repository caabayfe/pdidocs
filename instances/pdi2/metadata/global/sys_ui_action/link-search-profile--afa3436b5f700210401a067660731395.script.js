var profileSysID = action.getGlideURI().get('sysparm_collectionID');

/* Go to the form to create a new mapping */
action.setRedirectURL('ais_rule_mirror_m2m.do?sys_id=-1&sysparm_query=mirror_target=' + profileSysID);

/* Return to this profile form when done */
var profileGR = new GlideRecord("ais_search_profile");
profileGR.get(profileSysID);
action.setReturnURL(profileGR);
