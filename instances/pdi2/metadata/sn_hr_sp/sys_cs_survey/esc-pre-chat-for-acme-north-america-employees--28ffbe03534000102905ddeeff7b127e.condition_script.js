(function executeCondition(/* glide record */ current) { 
	
	var userCriterias = ["6b6df061ff2121009b20ffffffffff44"];
	var isACMENorthAmericaEmployee = sn_uc.UserCriteriaLoader.userMatches(gs.getUserID(), userCriterias);
	if (!isACMENorthAmericaEmployee)
		return false;
	
	var isVAActive = GlidePluginManager.isActive('com.glide.cs.chatbot');
	var escPortalId = "70cd9f3b734b13001fdae9c54cf6a72f";
	var contextTable = current.getValue("context_table");
	
	var jsonBlobGr = new GlideRecord(contextTable);
	if (contextTable == "interaction_json_blob" && jsonBlobGr.get(current.getValue("context_document"))) {
		var jsonBlob = JSON.parse(jsonBlobGr.getValue("value"));
		var urlSuffix = jsonBlob.portal;
		var portalGr = new GlideRecord("sp_portal");
		if (portalGr.get("url_suffix",urlSuffix) && portalGr.getUniqueValue() == escPortalId) {
			if (!isVAActive)
				return true;
		}
			
	}
	return false;
})(current);
