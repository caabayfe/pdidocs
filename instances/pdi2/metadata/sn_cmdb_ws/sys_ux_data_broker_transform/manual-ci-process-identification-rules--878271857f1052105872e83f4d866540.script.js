function transform(input) {
	const tableName = input.ciClassName;
    const identification_rules = input.identification_rules;
    const dependencies = input.dependencies;
	const appId = input.applicationId;
	const refQuery = input.ciRefQuery || "";
    // If no identification rules are present, return empty object (?)
    if (!identification_rules || !identification_rules.rules || identification_rules.rules.length == 0) {
        return {};
    }

    const util = new sn_cmdb_ws.CMDBWsManualCreateCIService();
    return util.processIreRules(tableName, identification_rules, dependencies, appId, refQuery);
} 
