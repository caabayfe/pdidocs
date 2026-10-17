var IncidentNotificationUtil = Class.create();
IncidentNotificationUtil.prototype = Object.extendsObject(IncidentNotificationUtilSNC, {
    initialize: function() {
        IncidentNotificationUtilSNC.prototype.initialize.apply(this, arguments);
    },
    type: 'IncidentNotificationUtil'
});
