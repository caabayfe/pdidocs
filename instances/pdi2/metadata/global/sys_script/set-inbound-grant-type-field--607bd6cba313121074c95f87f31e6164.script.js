(function executeRule(current, previous /*null when async*/) {
	if("oauth_oidc_entity" == current.getTableName()) {
		current.setValue('inbound_grant_type', 'oidc');
	} else {
		var gru = GlideScriptRecordUtil.get(current);
		var changedField = gru.getChangedFields();
		if(changedField.size() == 1 && "Inbound Grant Type" == changedField.get(0)) {
			if(current.type == "oauth_provider") {
				current.setAbortAction(true);
			}
		} else {
			var api = new SNC.OAuthEntityBuilder(current);
			current.setValue('inbound_grant_type', api.getInboundGrantTypeForRecord());
		}
	}
})(current, previous);
