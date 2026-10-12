function transform(input) {
	var result = {};
	var templateRunId = input.templateRunSysId;
    if(templateRunId == '') {
		return result;
	}
	result = sn_cmdb.DuplicateTemplate.requestCancellation(templateRunId); 
	return result; 
}
