var EcNotificationHelperUtil = Class.create();
EcNotificationHelperUtil.prototype =  Object.extendsObject(EcNotificationHelperUtilSNC, {
    initialize: function() {
        EcNotificationHelperUtilSNC.prototype.initialize.apply(this, arguments);
    },
    type: 'EcNotificationHelperUtil'
});
