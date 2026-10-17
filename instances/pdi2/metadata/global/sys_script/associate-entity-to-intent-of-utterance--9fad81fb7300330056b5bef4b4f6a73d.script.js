
    (function executeRule(current, previous /*null when async*/ ) {

		var aggIntentEntity = new GlideAggregate('m2m_sys_nlu_intent_entity');
		aggIntentEntity.addQuery('entity', current.entity);
		aggIntentEntity.addQuery('intent', current.utterance.intent);
		aggIntentEntity.setGroup(false);
		aggIntentEntity.addAggregate("COUNT");
		aggIntentEntity.query();
		count = 0;
		if (aggIntentEntity.next()) {
			count = aggIntentEntity.getAggregate('COUNT');
			if (count == 0) {
				var grIntentEntity = new GlideRecord('m2m_sys_nlu_intent_entity');
				grIntentEntity.setValue('entity', current.entity);
				grIntentEntity.setValue('intent', current.utterance.intent);
				grIntentEntity.insert();
			}
		}
	})(current, previous);
