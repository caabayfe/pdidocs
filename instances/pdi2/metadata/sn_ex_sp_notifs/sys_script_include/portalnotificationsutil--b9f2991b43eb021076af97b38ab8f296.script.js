var PortalNotificationsUtil = Class.create();
PortalNotificationsUtil.prototype = Object.extendsObject(PortalNotificationsUtilSNC, {
    initialize: function() {
        PortalNotificationsUtilSNC.prototype.initialize.apply(this, arguments);
    },

    type: 'PortalNotificationsUtil'
});
