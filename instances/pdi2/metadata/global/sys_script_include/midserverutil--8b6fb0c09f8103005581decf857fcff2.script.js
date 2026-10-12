var MIDServerUtil;

(function() {

MIDServerUtil = {
	createOrUpdateIssue: createOrUpdateIssue,
	createOrUpdateUniqueIssue:createOrUpdateUniqueIssue,
	resolveExistingIssues: resolveExistingIssues,
	getUnresolvedIssueCount: getUnresolvedIssueCount,
	writeEvent: writeEvent,
	getClusterName: getClusterName,
	logInfo: logInfo,
	logWarning: logWarning,
	logError: logError,
	MID_SERVER_SOURCE: 'MID Server'
};

/**
 * Insert or update an issue based on MID, source and message.  Existing resolved issues are ignored.
 *
 */
function createOrUpdateIssue(midSysId, issueSource, issueMessage) {
	var issueSysId;

	var issue = new GlideRecord('ecc_agent_issue');
	issue.addQuery('mid_server', midSysId);
	issue.addQuery('source', issueSource);
	issue.addQuery('message', issueMessage);
	issue.addQuery('state', '!=', 'resolved');
	issue.query();

	if (issue.next()) {
		issueSysId = issue.getValue('sys_id');
		// issue exists, just update last_detected and count
		issue.setValue('last_detected', new GlideDateTime());
		issue.setValue('count', (+ issue.getValue('count')) + 1);
		issue.update();
	} else {
		issue.initialize();
		issue.setValue('mid_server', midSysId);
		issue.setValue('source', issueSource);
		issue.setValue('message', issueMessage);
		issue.setValue('last_detected', new GlideDateTime());
		issueSysId = issue.insert();
	}

	return issueSysId;
}

/**
 * Resolve all open (acknowledged, new) issues for a given MID Server, source and (optionally) message.
 * If a message is given, only issues that match the message will be resolved.
 *
 */
function resolveExistingIssues(midSysId, issueSource, issueMessage) {
	var openIssues = new GlideRecord('ecc_agent_issue');
	openIssues.addQuery('mid_server', midSysId);
	openIssues.addQuery('source', issueSource);
	openIssues.addQuery('state', '!=', 'resolved');
	if (JSUtil.notNil(issueMessage))
		openIssues.addQuery('message', issueMessage);
	openIssues.query();
	
	// DEF0182644: Previous call to GlideRecord.updateMultiple was not resulting
	// in the update of audit fields (e.g. sys_updated_on)
	while (openIssues.next()) {
		openIssues.setValue('state', 'resolved');
		openIssues.update();
	}
}

/**
 * Get unresolved issue count for a given MID Server.
 */
function getUnresolvedIssueCount(midSysId) {
	var gr = new GlideRecord('ecc_agent_issue');
	gr.addQuery('mid_server', midSysId);
	gr.addQuery('state','!=','resolved');
	gr.query();
	return gr.getRowCount();
}

/**
 * Insert or update an issue record with the input message and resolve all issues with the
 * same source and different message.
 **/
function createOrUpdateUniqueIssue(midSysId, issueSource, message) {
	
	// Resolve all existing issues with the same source and different message
	var openIssues = new GlideRecord('ecc_agent_issue');
	openIssues.addQuery('mid_server', midSysId);
	openIssues.addQuery('source', issueSource);
	openIssues.addQuery('state', '!=', 'resolved');
	openIssues.addQuery('message', '!=' , message);
	openIssues.query();

	while (openIssues.next()) {
		openIssues.setValue('state', 'resolved');
		openIssues.update();
	}
	
	createOrUpdateIssue(midSysId, issueSource, message);
}

/**
 * Logging utilities
 **/
function logInfo(message, source) {
    gs.log(message, MIDServerUtil.MID_SERVER_SOURCE + (source ? ' ' + source : ''));
}

function logWarning(message, source) {
    gs.logWarning(message, MIDServerUtil.MID_SERVER_SOURCE + (source ? ' ' + source : ''));
}

function logError(message, source) {
    gs.logError(message, MIDServerUtil.MID_SERVER_SOURCE + (source ? ' ' + source : ''));
}

/**
 * Get the name of the cluster that the mid server belongs to.
 **/
function getClusterName(agentId) {
    var gr = new GlideRecord('ecc_agent_cluster_member_m2m');
    gr.addQuery('agent', agentId);
    gr.query();
    if (gr.next()) {
        var clusterId = '' + gr.cluster;
        var clusterCache = new SNC.ECCAgentClusterCache();
        var cluster = clusterCache.getBySysId(clusterId);
        if (cluster)
            return '' + cluster.name;
    }
    return '';
}

/**
 * Write a MID server lifecycle event to the event table
 **/
function writeEvent(agent, cluster, event, source, message) {
    var gr = new GlideRecord("mid_server_event");
    gr.initialize();
    gr.setValue("agent", agent);
    gr.setValue("cluster", cluster);
    gr.setValue("event", event);
    if (JSUtil.notNil(source)) {
        gr.setValue("source", source);
	} else {
		gr.setValue("source", "MID Server Lifecycle Event");
	}
    if (JSUtil.notNil(message))
        gr.setValue("message", message);
    gr.insert();
}

})();
