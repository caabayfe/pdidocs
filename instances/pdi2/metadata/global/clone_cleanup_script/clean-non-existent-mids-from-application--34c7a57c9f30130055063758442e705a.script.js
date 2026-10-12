var doesMidExist = function(midSysIdToCheck) {
	return midSysIdToCheck && (new GlideRecord('ecc_agent')).get('sys_id', midSysIdToCheck);
};

var agentApplicationGlideRecord = new GlideRecord('ecc_agent_application'),
	source = 'MIDApplicationCloning',
	message = '';
agentApplicationGlideRecord.query();

while (agentApplicationGlideRecord.next()) {

	if (JSUtil.notNil(agentApplicationGlideRecord.default_mid_server) && !doesMidExist(agentApplicationGlideRecord.default_mid_server)) {
		message = 'Default MID server "' + agentApplicationGlideRecord.default_mid_server + '" for "' + agentApplicationGlideRecord.name + '" MID application doesn\'t exist on this instance and will be removed from this application.';
		MIDServerUtil.createOrUpdateIssue('', source, message);
		agentApplicationGlideRecord.default_mid_server = '';
		agentApplicationGlideRecord.update();
		MIDServerUtil.resolveExistingIssues('', source, message);
	}
}
