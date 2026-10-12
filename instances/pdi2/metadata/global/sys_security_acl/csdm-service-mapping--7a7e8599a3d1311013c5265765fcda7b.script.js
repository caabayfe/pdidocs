answer = getServiceAclAnswer();

function getServiceAclAnswer() {
	if (current.service.nil())
		return true;

	var serviceRecord = new GlideRecord(current.service_table);
	if(serviceRecord.get(current.service)) {
		return serviceRecord.canRead();
	}
	
	return false;
}
