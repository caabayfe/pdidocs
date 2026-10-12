answer = getEntityProfileACLAnswer();

function getEntityProfileACLAnswer(){
	if(gs.hasRole("maint") || current.user == gs.getUserID()){
		return true;
	}
	if(!gs.hasRole("oauth_admin")){
		return false;
	}
	try {
		var entityProfileGR = current.oauth_requestor_profile.oauth_entity_profile.getRefRecord();

		if(entityProfileGR.isValidRecord()){
			var denylistedIdsProperty = gs.getProperty("glide.oauth.entity_profile_denylist", "");
			var denylistedIds = denylistedIdsProperty.split(",");
			if (denylistedIds.indexOf(entityProfileGR.getValue("sys_id")) > -1) {
				return false;
			}
		}
	}
	catch (e) {
		return true;
	}
	return true;
}
