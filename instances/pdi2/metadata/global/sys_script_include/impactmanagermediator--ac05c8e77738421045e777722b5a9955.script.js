var ImpactManagerMediator = Class.create();
ImpactManagerMediator.prototype = {
    initialize: function() {
        this.impactManager = new SNC.ImpactManager();
    },

    getMapSeverities: function(bsId, timestamp, connectedServices) {
        return this.impactManager.getMapSeverities(bsId, timestamp, connectedServices);
    },

    getPathMapSeverities: function(bsId, pathIds, timestamp) {
        return this.impactManager.getPathMapSeverities(bsId, pathIds, timestamp);
    },

    getAlertIdsForBS: function(filter, filterGroups, pathIds, timestamp) {
        return this.impactManager.getAlertIdsForBS(filter, filterGroups, pathIds, timestamp);
    },

    type: "ImpactManagerMediator"
};
