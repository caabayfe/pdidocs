if (gs.hasRole("mid_server") && (isAgentValid() || (request.purpose == "UpdatePublicKey"))) {
    var requestType = request.purpose;
    var MIDServerInfoAccessor = new GlideMIDServerInfoAccessor();

	switch (requestType) {
		case "GetCredentials":
			getCredentials();
			break;
		case "GetPersonalAuthCredentialData":
			getPersonalAuthCredentialData();
			break;
		case "GetCredentialData":
			getCredentialData();
			break;
		case "GetCertificatePolicies":
			getCertificatePolicies();
			break;
		case "UpdateFileDiscoveryWhitelist":
			updateFileDiscoveryWhitelist();
			break;
		case "GetAgentAggregate":
			getAgentAggregate();
			break;
		case "GetQueueProcessingIds":
			getQueueProcessingIds('processing');
			break;
		case "GetQueueSysIdsByState":
			getQueueProcessingIds(null);
			break;
		case "UpdateQueueFromProcessingToReady":
			updateEccQueueProcessingToReady();
			break;
		case "UpdateQueueFromReadyToProcessing":
			updateEccQueueReadyToProcessing();
			break;
		case "UpdateCredentialAffinity":
			updateCredentialAffinity();
			break;
		case "GetAutomationEncryptionKeys":
			getAutomationEncryptionKeys();
			break;
		case "GetEncrypterAPIData":
			getEncrypterAPIData();
			break;
        case "UpdateOrInsertPrivAffinity":
            insertOrUpdatePrivilegedCommandAffinity();
            break;
        case "DeletePrivAffinity":
            deletePrivilegedCommandAffinity();
            break;
		case "GetIsAgentValid":
			getIsAgentValid();
			break;
		case "GetCloudServiceAccountInfo":
			getCloudServiceAccountInfo();
			break;
		case "UpdatePublicKey":
			updatePublicKey();
			break;
		default:
			gs.log("Unsupported request type: " + requestType);
	}

} else {
    response.midInfo = "Insufficient rights";
}

function getIsAgentValid() {
	var isValid = isAgentValid();
	response.midInfo = MIDServerInfoAccessor.getIsAgentValid(isValid);
}

function isAgentValid() {
	return new MIDServerManage().isAgentValid(request.agent);
}

function getCredentials() {
    // Setting a session property to indicate that this session is initiated by Mid Server callback
    GlideSession.get().putProperty("MidCallbackOnCredentialsReload", true);
	var agent = request.agent;
    var doc = MIDServerInfoAccessor.getCredentialXML(agent);

    response.midInfo = doc;
    GlideSession.get().putProperty("MidCallbackOnCredentialsReload", false);
}

function getPersonalAuthCredentialData() {
	var agent = request.agent;
	var credentialId = request.credential_id;
	var username = request.credential_username;
	var doc = MIDServerInfoAccessor.getPersonalCredentialXML(agent, credentialId, username);
	response.midInfo = doc;
}

function getCredentialData() {
	var agent = request.agent;
	var credentialId = request.credential_id;
	var doc = MIDServerInfoAccessor.getCredentialXMLByCredentialId(agent, credentialId);
	response.midInfo = doc;
}

function getCertificatePolicies() {
	var agent = request.agent;
    var doc = MIDServerInfoAccessor.getCertificatePolicyXML(agent);

    response.midInfo = doc;
}

function updateFileDiscoveryWhitelist() {

	var agent = request.agent;
	var doc = MIDServerInfoAccessor.updateFileDiscoveryWhitelist(agent);

	response.midInfo = doc;
}

function updateCredentialAffinity() {
    var type = request.type;
    var affinityId = request.affinity_id;
    var agentId = request.agent;
    var credentialId = request.credential_id;
    var probe = request.probe_id;
    var credentialTag = request.credential_tag;

    var res = MIDServerInfoAccessor.insertOrUpdateAffinity(type, affinityId, agentId, credentialId, probe, credentialTag);

    if (res)
        response.midInfo = res;
}

function getAgentAggregate() {

	var table = request.table;
	var permittedTables = ['ecc_queue'];

	if (table && permittedTables.indexOf(table) >= 0) {
		var aggregate = request.aggregate;
		var field = request.field;

		var ga = new GlideAggregate(table);
		ga.setGroup(false);
		ga.addAggregate(aggregate, field);
		ga.addQuery('agent', request.agent);

		var query = request.query;
		if (query) {
			ga.addEncodedQuery(query, true);
		}
		ga.query();

		var aggregateValue = ga.next() ? ga.getAggregate(aggregate, field) : null;
		var respObj = { 'GetAggregate' : { 'aggregate' : aggregateValue } };

		response.midInfo = new XMLHelper().toXMLDoc(respObj);

	} else {
		response.error = 'Invalid request.';
	}
}

function getQueueProcessingIds(state) {
	
	var agent = request.agent;
	var after = request.after;
	var lastSysId = request.lastSysId;
	var limit = parseInt(request.batchSize);

	if (!state)
		state = request.state;

	var gr = new GlideRecord('ecc_queue');
	gr.orderByDesc('sys_id');
	gr.setLimit(limit);
	
	gr.addQuery('agent', agent);
	gr.addQuery('queue', 'output');
	gr.addQuery('state', state);
	gr.addQuery('sys_created_on', '>', after);
	
	if (lastSysId)
		gr.addQuery('sys_id', '<', lastSysId);
	
	gr.query();
	
	var sysIds = [];	
	while (gr.next())
		sysIds.push(gr.getValue('sys_id'));
	var sysIdsValue = sysIds.join(",");
	
	var respObj = { 'GetQueueProcessingIds': { 'sysIds': sysIdsValue } };	
	response.midInfo = new XMLHelper().toXMLDoc(respObj);
}

function updateEccQueueProcessingToReady() {
	var agentId = request.agent;
	var sysIds = request.sysIds;

	var gr = new GlideRecord('ecc_queue');
	
	// allow for smaller batch calls if list of sys_ids is supplied
	if (sysIds)
		gr.addQuery('sys_id', 'IN', sysIds);
	
	gr.addQuery('state', 'processing');
	gr.addQuery('agent', agentId);
	gr.addQuery('queue', 'output');
	gr.setValue('state', 'ready');
	gr.updateMultiple();
}

function updateEccQueueReadyToProcessing () {
	var agentId = request.agent;
	var sysids = request.sysids;

	var gr = new GlideRecord('ecc_queue');
	gr.addQuery('state', 'ready');
	gr.addQuery('agent', agentId);
	gr.addQuery('sys_id', 'IN', sysids);
	gr.addQuery('queue', 'output');
	gr.setValue('state', 'processing');
	gr.updateMultiple();
}

function insertOrUpdatePrivilegedCommandAffinity(){
    var midServerId = request.agent;
    var affinityId = request.affinityId;
    var command = request.command;
    var res = MIDServerInfoAccessor.insertOrUpdatePrivAffinity(midServerId, affinityId, command);
    response.midInfo = res;
}

function deletePrivilegedCommandAffinity(){
    var midServerId = request.agent;
    var affinityId = request.affinityId;
    var command = request.command;
    var res = MIDServerInfoAccessor.deletePrivAffinity(midServerId, affinityId, command);
    response.midInfo = res;
}

function getAutomationEncryptionKeys() {
	var agent = request.agent;
	var doc = MIDServerInfoAccessor.getAutomationEncryptionKeysXML(agent);

	response.midInfo = doc;
}

function getEncrypterAPIData() {
	var agent = request.agent;
	var doc = MIDServerInfoAccessor.getEncrypterAPIDataXML(agent);

	response.midInfo = doc;
}

function getCloudServiceAccountInfo() {
	var cloudServiceAccountInfoUtil = new CloudServiceAccountInfoUtil();
	var doc = cloudServiceAccountInfoUtil.getCloudServiceAccountInfoXML();
	
	response.midInfo = doc;
}

function updatePublicKey() {
	var agentId = request.agent ? request.agent : '';
	var key = request.public_key ? request.public_key : '';
	var signature = request.update_signature ? request.update_signature : '';
	var isUsingMutualAuth = request.is_using_mutual_auth ? request.is_using_mutual_auth : 'false';
	var doc = MIDServerInfoAccessor.updatePublicKey(agentId, key, signature, isUsingMutualAuth === 'true');
	gs.info('updatePublicKey: ' + GlideXMLUtil.toString(doc));
	response.midInfo = doc;
}
