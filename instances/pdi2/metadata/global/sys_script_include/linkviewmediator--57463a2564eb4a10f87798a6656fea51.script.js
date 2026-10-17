var LinkViewMediator = Class.create();
LinkViewMediator.prototype = {
    initialize: function() {},
    getRelatedCIs: function(ci_id) {
        var processor = new SNC.ServiceAnalyticsProcessor();
        var relatedCis = processor.getRelatedCIs(ci_id);
        return relatedCis;
    },
    type: 'LinkViewMediator'
};
