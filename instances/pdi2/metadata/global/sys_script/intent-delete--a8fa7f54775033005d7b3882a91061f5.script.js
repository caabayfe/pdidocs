(function executeRule(current, previous /*null when async*/) {

	var modelId;
	var entityRec = new GlideRecord("sys_nlu_entity");
    var joinQuery = entityRec.addJoinQuery('m2m_sys_nlu_intent_entity', 'sys_id', 'entity');
    joinQuery.addCondition("intent", current.getValue("sys_id"));
	entityRec.query();
	
	while (entityRec.next()) {
		modelId = entityRec.getValue("model");
		var intentEntityRec = new GlideRecord('m2m_sys_nlu_intent_entity');
		intentEntityRec.addQuery('entity', entityRec.getValue('sys_id'));
		intentEntityRec.addQuery('intent', '!=', current.getValue("sys_id"));
		intentEntityRec.query();
		if(!modelId && (intentEntityRec.getRowCount() == 0)){
			entityRec.deleteRecord();
		}
	}
})(current, previous);
