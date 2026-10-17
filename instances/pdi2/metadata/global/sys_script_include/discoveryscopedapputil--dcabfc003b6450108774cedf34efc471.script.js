var DiscoveryScopedAppUtil = Class.create();
DiscoveryScopedAppUtil.prototype = {
    initialize: function() {
        this.GLOBAL_DOMAIN_ID = 'global';
    },

    getCurrentDomainId: function() {
        var currentDomain = gs.getUser().getDomainID();
        return (currentDomain) ? currentDomain : this.GLOBAL_DOMAIN_ID;
    },

    triggerProbe: function(probeName, source, eccPriority, midSelectDetails, parametersMap, agent, eccQueueId) {
        if (!probeName || !source || !eccPriority || !agent)
            return;
        var probe = SncProbe.get(probeName);
        probe.setSource(source);
        probe.setEccPriority(eccPriority);
        if (midSelectDetails)
            probe.setMidSelectDetails(midSelectDetails);
        if (parametersMap) {
            Object.keys(parametersMap).forEach(function(key) {
                probe.addParameter(key, parametersMap[key]);
            });
        }
        if (eccQueueId)
			probe.create(agent, eccQueueId);
		else
            probe.create(agent);
    },

    type: 'DiscoveryScopedAppUtil'
};
