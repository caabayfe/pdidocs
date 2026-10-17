/**
This script removes orphaned containerized mid servers if they are down more than max_retention_days.
Containerized mid server are the ones with 'null' or 'empty' container_id.
    - If containerized mid servers are down for more than max_retention_days, delete mid server records
    - If containerized mid servers are down for less than (max_retention_days - warn_days), then clear mid issue records
    - If containerized mid servers are down for more than (max_retention_days - warn_days), then create a mid issue records
*/

purgeOrphanedMIDContainers(30, 7);

function purgeOrphanedMIDContainers(max_retention_days, warn_days) {
	var issueSource = "PurgeOrphanedContainerizedMID";
	var issueMessage = "Warning: The MID server will be removed after it is down for more than max retention days";
	var count = 0;

	if (max_retention_days <= warn_days || warn_days < 3) {
		gs.log("Aborted execution. max_retention_days must be greater than warn_days and warn_days must be at least 3!");
		return;
	}
	
	//-----------------------------------------------------
	// 1. Remove orphan containerized mid servers
	//-----------------------------------------------------
	var agentGr = new GlideRecord('ecc_agent');
	agentGr.addNotNullQuery("container_id");
	agentGr.addQuery("status", 'Down');
	// 'last_refreshed' is the last time the mid server successfully sent a heart beat to instance
	// Note that we cannot use 'stopped' because mid server may not shut down cleanly
	agentGr.addQuery("last_refreshed", "<=", gs.daysAgo(max_retention_days));
	agentGr.query();
	count = agentGr.getRowCount();
	agentGr.deleteMultiple();
	gs.log("Deleted " + count + " orphaned containerized mid server records");

	//-----------------------------------------------------
	// 2. Resolve existing issue if MID is alive again
	//-----------------------------------------------------
	var agentIssueGr = new GlideRecord('ecc_agent_issue');
	agentIssueGr.addQuery("source", issueSource);
	agentIssueGr.addQuery("message", issueMessage);
	agentIssueGr.query();
	var listAgentSysIds = "";
	while (agentIssueGr.next()) {
		if (listAgentSysIds != '')
			listAgentSysIds += ",";
		listAgentSysIds += agentIssueGr.getValue("mid_server");
	}

	var midManage = new MIDServerManage();
	var agentSysId;
	
	agentGr = new GlideRecord('ecc_agent');
	agentGr.addNotNullQuery("container_id");
	agentGr.addQuery("sys_id", 'in', listAgentSysIds);
	agentGr.addQuery("last_refreshed", ">", gs.daysAgo(max_retention_days - warn_days));
	agentGr.query();
	count = 0;
	while (agentGr.next()) {
		agentSysId = agentGr.getUniqueValue();
		midManage.resolveExistingIssues(agentSysId, issueSource, issueMessage); 
		count += 1;
	}
	
	if (count > 0) {
		gs.log("Resolved " + count + " " + issueSource + " issue records");
	}

	//-----------------------------------------------------
	// 3. Create new issue if MID reaches the grace period
	//-----------------------------------------------------
	agentGr = new GlideRecord('ecc_agent');
	agentGr.addNotNullQuery("container_id");
	agentGr.addQuery("status", 'Down');
	agentGr.addQuery("last_refreshed", "<=", gs.daysAgo(max_retention_days - warn_days));
	agentGr.query();
	count = 0;
	while (agentGr.next()) {
		agentSysId = agentGr.getUniqueValue();
		midManage.createOrUpdateIssue(agentSysId, issueSource, issueMessage);
		count += 1;
	}
	
	if (count > 0) {
		gs.log("Created " + count + " " + issueSource + " issue records");
	}
}
