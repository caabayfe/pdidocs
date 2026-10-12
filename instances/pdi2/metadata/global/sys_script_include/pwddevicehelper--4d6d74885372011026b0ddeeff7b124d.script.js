var PwdDeviceHelper = Class.create();
PwdDeviceHelper.prototype = {
    initialize: function() {},

    getDevicesOrEmailAddresses: function(userId, requestId, type) {
        var device;
        var trackingManager = new SNC.PwdTrackingManager();
        var isRequestInvalid = trackingManager.isRequestInvalid(requestId);
        var userName = trackingManager.getUserName(requestId);
        if (isRequestInvalid && !gs.nil(userName)) {
            userId = userName;
        }
        userId = userId.trim();
        if (type == 'SMS') {
            if (isRequestInvalid) {
                userId = JSON.stringify(userId).toLowerCase();
                var num = 1;
                for (var i = 0; i < userId.length; i++) {
                    num = num * userId.charCodeAt(i);
                }
                device = num.toString();
                while (device.length < 10) {
                    device = device * device;
                }
                device = device.substring(0, 10);
            } else {
                device = new PwdNotificationHelper().getMobileFromProfile(userId);
            }
        } else if (type == 'Email') {
            if (isRequestInvalid) {
                device = userId + "@example.com";
            } else {
                device = new PwdNotificationHelper().getEmailFromProfile(userId);
            }
        }
		return device;
    },

    type: 'PwdDeviceHelper'
};
