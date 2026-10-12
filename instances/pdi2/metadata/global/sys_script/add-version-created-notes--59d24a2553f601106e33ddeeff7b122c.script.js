(function executeRule(current, previous /*null when async*/) {

	var documentActivityProperty = 'glide.documents.journal.enabled';
	var propertyGR = new GlideRecord('sys_properties');
	propertyGR.addQuery('name',documentActivityProperty);
	propertyGR.query();
	
	if (propertyGR.next() && propertyGR.value != 'true')
		return;
	
	if (current.operation() == 'insert') {
		var v = new DocumentActivityStreamManager();
		v.pushVersionCreatedActivity(current.sys_id);
	} 
	// Add your code here

})(current, previous);
