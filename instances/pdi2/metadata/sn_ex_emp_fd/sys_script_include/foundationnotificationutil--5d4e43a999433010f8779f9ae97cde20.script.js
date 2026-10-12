var FoundationNotificationUtil = Class.create();
    FoundationNotificationUtil.prototype = Object.extendsObject(FoundationNotificationUtilSNC, {
        initialize: function() {
        FoundationNotificationUtilSNC.prototype.initialize.apply(this, arguments);
        },

        type: 'FoundationNotificationUtil'
    });
