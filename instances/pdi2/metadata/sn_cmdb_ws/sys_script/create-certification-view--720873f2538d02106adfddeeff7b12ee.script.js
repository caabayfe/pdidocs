(function executeRule(current, previous /*null when async*/) {

	var policyCertGr = new CMDBWsDMPolicyAccessor().getCertificationPolicyById(current.cmdb_policy);
	var certTable = policyCertGr.getValue('table');
	var displayFields = policyCertGr.getValue('display_fields');
	var certificationFields = policyCertGr.getValue('certification_fields');
	new CMDBWsDMPolicyManager().getCertificationPolicyViewName(certTable, displayFields, certificationFields);


})(current, previous);
