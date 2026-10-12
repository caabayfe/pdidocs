/**
 * Service-now.com
 * 
 * Description: If the MID server is in a cluster, potentially replace the agent with the proper one.
 */

runMIDManagement();

function runMIDManagement() {
    var agentGr = getMIDServerGr();
    if (JSUtil.nil(agentGr))
        return;

	// only use cluster for Shazzam if the MID is down
	if (current.topic == "Shazzam" && agentGr.status == "Up") 
		return;

	// If probe param ECC_AGENT_SELECTOR_DETAILS exists in payload, then exit and don't use
	// legacy cluster management. For performance, uses a cached regex instead of a real XML parser.
	var midSelectorRegex = new SNC.Regex(GlideappIECC.ECC_AGENT_SELECTOR_DETAILS_REGEX+'');
	if (midSelectorRegex.match(current.payload))
		return;

	// only if a mid is down should a failover cluster be considered
	var msc;
	if (agentGr.status == "Down" || agentGr.status == "Upgrade Failed")
		msc = new MIDServerCluster(agentGr, "Failover");
	else
    	msc = new MIDServerCluster(agentGr, "Load Balance");
	
    if (!msc.clusterExists())  // no available clusters of any kind
        return;
	
    var newAgent = msc.getClusterAgent();
    current.agent = "mid.server." + newAgent;
}

function getMIDServerGr() {
    var agentName = current.agent;
    agentName = agentName.substring("mid.server.".length, agentName.length);
 
    var agentCache = new SNC.ECCAgentCache();
	var gr = agentCache.getByName(agentName);
 	
    if (!gr)
        return;   
 
    return gr;
}
