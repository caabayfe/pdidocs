function transform(input) {
	var interactionSysId = input.interactionSysId;
	var recordType = input.recordType;
	var recordSysId = input.recordSysId;
	if (!interactionSysId || !recordSysId)
		return;
	
	var irrGr = new GlideRecord('interaction_related_record');
	irrGr.addQuery('interaction' , interactionSysId);
	irrGr.addQuery('document_table' , recordType);
	irrGr.addQuery('task' , recordSysId);
	irrGr.query();
	
	if (!irrGr.canCreate() || irrGr.hasNext())
		return;
	irrGr.interaction = interactionSysId;
	irrGr.document_table = recordType;
	irrGr.task = recordSysId;
	irrGr.insert();
}
