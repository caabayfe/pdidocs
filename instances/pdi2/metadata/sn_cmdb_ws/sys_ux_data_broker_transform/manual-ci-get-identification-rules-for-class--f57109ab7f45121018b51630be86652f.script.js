function transform(input) {
	return {"result": JSON.parse(JSON.parse(sn_cmdb.CMDBIntStudioScriptableAPI.getIdentificationRulesByCiType(input.ciClassName))[0])};
} 
