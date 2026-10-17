var ServiceMappingACCUtil = Class.create();
ServiceMappingACCUtil.prototype = {
    initialize: function() {
        this.accMappingMode = parseInt(gs.getProperty('sa.topdown.mapping_with_acc_mode', 0));
        this.accVActive = GlidePluginManager.isActive('sn_acc_vis_content');
    },

    getAgentForHostOrIp: function(hostId, hostIp) {
        if ((this.accMappingMode !== 1 && this.accMappingMode !== 2) || !this.accVActive)
            return null;

        // Verify correctness of input data
        hostId = gs.nil(hostId) ? null : hostId;
        hostIp = gs.nil(hostIp) ? null : hostIp;
        if (hostId == null && hostIp == null)
            return null;

        // Find the relevant agent for this host
        var accGr = new GlideRecord('sn_agent_ci_extended_info');
        // Try to find the agent using the ID of host computer, otherwise use the IP of host
        if (hostId)
            accGr.addQuery('cmdb_ci', hostId);
        else
            accGr.addQuery('ip_address', hostIp);

        accGr.addQuery('data_collection', '0'); // verify data collection is 'On'
        accGr.addQuery('status', '0'); // verify agent is 'Up'
        accGr.query();

        if (accGr.next() && accGr.mid.status == 'Up' && accGr.mid.validated == 'true' && !gs.nil(accGr.getDisplayValue('mid')))
            return accGr;
        return null;
    },

    type: 'ServiceMappingACCUtil'
};
