var ServiceSubscriptionUtils = Class.create();

ServiceSubscriptionUtils.prototype = Object.extendsObject(ServiceSubscriptionUtilsSNC, {
    initialize: function() {
		global.ServiceSubscriptionUtilsSNC.prototype.initialize.call(this);
    },

    type: 'ServiceSubscriptionUtils'
});
