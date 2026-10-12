var ParticipantSuggestionsGlobalUtils = Class.create();
ParticipantSuggestionsGlobalUtils.checkParticipantAccess = function(filteredMap, documentId, documentTable){
	var finRes = [];
	for(var p = 0; p < filteredMap.length; p++){
		var gg = new GlideRecord(documentTable);
		var originalUserId = gs.getUserID();
		try {
			gs.getSession().impersonate(filteredMap[p].participantId);
			gg.addQuery('sys_id', documentId);
			gg.query();
			if (gg.next()) {
				if (gg.canRead()) {
					finRes.push(filteredMap[p].participantId);
				}
			} 
		} catch(ex) {
			gs.error(ex);
		} finally{
			gs.getSession().impersonate(originalUserId);
		}
	}
	return finRes;
};
ParticipantSuggestionsGlobalUtils.getUserGroup = function() {
		var gr = new GlideRecord('sys_user_group');
		gr.addActiveQuery();
		gr.query();
		while(gr.next()){
			answer.add(gr.getValue('sys_id'),gr.getValue('name'));
		}
};
