(function executeRule(current, previous /*null when async*/) {

	var documentActivityProperty = 'glide.documents.journal.enabled';
	var propertyGR = new GlideRecord('sys_properties');
	propertyGR.addQuery('name',documentActivityProperty);
	propertyGR.query();
	
	if (propertyGR.next() && propertyGR.value != 'true')
		return;

	if (current.operation() == 'insert') {
		var v = new DocumentActivityStreamManager();
		v.pushAttachDocumentToRecordActivity(current.table_name, current.target_record, current.document);
	} else if (current.operation() == 'delete') {
		var v = new DocumentActivityStreamManager();
		v.pushDetachDocumentFromRecordActivity(current.table_name, current.target_record, current.document);
	}
})(current, previous);
