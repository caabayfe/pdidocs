var RequestNotificationUpgradeUtil = Class.create();
RequestNotificationUpgradeUtil.prototype = Object.extendsObject(RequestNotificationUpgradeUtilSNC, {
    initialize: function() {
		RequestNotificationUpgradeUtilSNC.prototype.initialize.apply(this, arguments);
    },

    type: 'RequestNotificationUpgradeUtil'
});
