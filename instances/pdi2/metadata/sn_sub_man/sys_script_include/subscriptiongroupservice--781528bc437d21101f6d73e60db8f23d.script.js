var SubscriptionGroupService = Class.create();
SubscriptionGroupService.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    addGroupsToSubscription: function() {

        var subscriptionSysId = this.getParameter('subscriptionSysId');
        var groupIds = this.getParameter('groupIds').split(',');

        var gr = new GlideRecordSecure('group_has_subscription');
        for (let i = 0; i < groupIds.length; i++) {
            {
                gr.initialize();
                gr.group = groupIds[i];
                gr.subscription = subscriptionSysId;
                gr.insert();
            }

        }
    },
    type: 'SubscriptionGroupService'
});
