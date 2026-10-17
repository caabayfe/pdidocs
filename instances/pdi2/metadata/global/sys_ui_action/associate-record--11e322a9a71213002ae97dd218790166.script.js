if(current.update()){
	var relatedRecord = new GlideRecord("interaction_related_record");
	relatedRecord.newRecord();
	relatedRecord.interaction = current.sys_id;
	action.openGlideRecord(relatedRecord);
}
