function transform(input) {
	var result = {};
	var templateId = input.templateSysId;

	result = sn_cmdb.DuplicateTemplate.publishTemplate(templateId);
	return result; 
}
