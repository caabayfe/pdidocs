function transform(input) {
	var result = {};
	var templateId = input.templateSysId;

	result = sn_cmdb.DuplicateTemplate.unPublishTemplate(templateId);
	return result; 
}
