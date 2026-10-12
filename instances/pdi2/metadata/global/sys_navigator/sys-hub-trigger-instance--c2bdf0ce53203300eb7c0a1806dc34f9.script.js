(function() {
    var sysId = g_request.getParameter('sys_id');
    if (!gs.nil(sysId)) {
     var sysHubTriggerInstanceGr = new GlideRecord("sys_hub_trigger_instance");
     if(!sysHubTriggerInstanceGr.get(sysId)){
		sysHubTriggerInstanceGr = new GlideRecord("sys_hub_trigger_instance_v2");
		sysHubTriggerInstanceGr.get(sysId);
	 }

     if (!gs.nil(sysHubTriggerInstanceGr.flow) && isValidSysHubFlow(String(sysHubTriggerInstanceGr.flow)))
         return g_uri.toString('$flow-designer.do?sysparm_nostack=true#/flow-designer/' + sysHubTriggerInstanceGr.flow);
 }

    return g_uri.toString('$flow-designer.do?sysparm_nostack=true#');
})();

function isValidSysHubFlow(sysId) {
    var sysHubFlowGr = new GlideRecord("sys_hub_flow");
    return sysHubFlowGr.get(sysId);
}
