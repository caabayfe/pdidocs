var NowAssistPurchasedCounts = Class.create();
NowAssistPurchasedCounts.prototype = {
    initialize: function() {
        this.subscriptionEntitlementsService = new sn_entitlement.SubscriptionEntitlementsService();
    },

    getNowAssistPurchasedCounts: function() {
        return {
            "usage": this._getNowAssistUsagePurchasedCount(),
            "creators": this._getNowAssistCreatorsPurchasedCount()
            };
    },

    _getNowAssistUsagePurchasedCount() {
        const assistUsageInfo = this.subscriptionEntitlementsService.getNowAssistSKUUsageInfo();
        return assistUsageInfo.total_assist_purchased_count;
    },

    _getNowAssistCreatorsPurchasedCount() {
        const asssistCreatorInfo = this.subscriptionEntitlementsService.getGenAICreatorSKUUsageInfo();
        return asssistCreatorInfo.total_creator_purchased_count;
    },

    type: 'NowAssistPurchasedCounts'
};
