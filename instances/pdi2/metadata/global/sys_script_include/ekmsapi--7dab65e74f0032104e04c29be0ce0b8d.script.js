var EKMSApi = Class.create();
EKMSApi.prototype = {
    initialize: function() {},

    getStats: function() {
        return new SNC.InstanceEKMSStatsAPI().getStats();
    },

    preflightCheck: function(source, target) {
        return new SNC.InstanceEKMSStatsAPI().preflightCheck(source, target);
    },

    type: 'EKMSApi'
};
