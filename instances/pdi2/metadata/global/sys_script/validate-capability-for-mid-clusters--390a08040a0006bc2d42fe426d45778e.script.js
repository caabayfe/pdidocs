/**
 * Service-now.com
 *
 * Description: If the MID server is already part of a cluster, we need to check the following. 
 * If the capability deleted is the last one of the MID server, then we need to pull the MID server 
 * out of that cluster and warn the user.
 */

validateCapabilityForCluster();

function validateCapabilityForCluster() {
    if (!isAgentInClusters())
        return;

    var gr = new GlideRecord("ecc_agent_capability_m2m"); 
    gr.addQuery("agent", current.agent);
    gr.query();
    if (gr.next()){
        var agentMessage = getClustersByAgent(current.agent).join(", ");
        gs.addInfoMessage(gs.getMesssage("If all capabilities are deleted, the MID server will be removed from the following clusters, {0}", agentMessage));
    }
    else {
        var agentMsg = getClustersByAgent(current.agent).join(", ");
        var grec = new GlideRecord("ecc_agent_cluster_member_m2m");
        grec.addQuery("agent", current.agent);
        grec.deleteMultiple();
       gs.addInfoMessage(gs.getMessage("Removed MID server from the following clusters, {0} because there are no more capabilities associated with the MID server.", agentMsg));
    }
}

function isAgentInClusters() {
    var gr = new GlideRecord("ecc_agent_cluster_member_m2m");
    gr.addQuery("agent", current.agent);
    gr.query();
    if (gr.next())
        return true;

    return false;
}

function getClustersByAgent(agent) {
    var clusters = [];
    var gr = new GlideRecord("ecc_agent_cluster_member_m2m");
    gr.addQuery("agent", agent);
    gr.query();
    while (gr.next())
        clusters.push(gr.cluster.name+'');

    return clusters;
}
