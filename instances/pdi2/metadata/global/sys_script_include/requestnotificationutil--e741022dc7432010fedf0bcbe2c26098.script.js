var RequestNotificationUtil = Class.create();
RequestNotificationUtil.prototype = Object.extendsObject(RequestNotificationUtilSNC, {
    initialize: function() {
        RequestNotificationUtilSNC.prototype.initialize.apply(this, arguments);
    },

    type: 'RequestNotificationUtil'
});
