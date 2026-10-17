var query = current.getEncodedQuery();
if (query.indexOf('sys_id=') != 0 &&
	query.indexOf('sys_idIN') != 0 &&
	query.indexOf('identifier=') != 0)
	new IdentificationRuleValidator().validate();
