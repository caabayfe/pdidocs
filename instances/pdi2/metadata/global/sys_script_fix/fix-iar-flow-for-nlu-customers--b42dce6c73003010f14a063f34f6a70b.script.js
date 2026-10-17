executeFix();

function executeFix() {
	
	if (!AutoResolutionUtil.intentTopicMapRecordsExist()) {
		gs.info('IAR Fix Script execution: there are no records in {0} table, nothing to be updated.', AutoResolutionConstants.INTENT_TOPIC_MAP_TABLE_NAME);
		return;
	}
	
	//if there is any active record then that implies customer has already been using IAR when NLU is disabled, so nothing needs to be updated
	if (AutoResolutionUtil.isAnyIntentTopicMapRecordActive()) {
		gs.info('IAR Fix Script execution: there is atleast one active record in {0} table, nothing to be updated.', AutoResolutionConstants.INTENT_TOPIC_MAP_TABLE_NAME);
		return;
	}
	
	//if intent topic map records exist find alternative matched topic for each intent and update the record
	AutoResolutionUtil.updateIntentTopicMapRecords();
}
