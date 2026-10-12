var GlideDeviceRegistration = Class.create();
GlideDeviceRegistration.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    loadPopupContent: function() {
        var contentMap = new Packages.java.util.HashMap();
        var result = this.newItem("result");
        contentMap = SNC.DeviceRegistrationUtils.loadPopupContent();
        if (contentMap != null) {
            result.setAttribute("validated", contentMap.get("registered").toString());
            result.setAttribute("qrCodeURL", contentMap.get("qrCodeURL").toString());
            result.setAttribute("qrCodeText", contentMap.get("qrCodeText").toString());
            result.setAttribute("app_id", contentMap.get("app_id").toString());
            result.setAttribute("registrationTime", contentMap.get("registration_time").toString());
        }
    },

    removeDeviceRegistration: function(sysId) {
        if (sysId)
            var sys_id = sysId;
        else
            var sys_id = this.getParameter('sysparm_sys_id');

        if (GlideStringUtil.nil(sys_id)) {
            return false;
        }

        var gr = new GlideRecord('sys_auth_policy_device_app_registry');

        if (!gr.isValid())
            return false;

        gr.addQuery('user', gs.getUserID());
        gr.addQuery("sys_id", sys_id);
        gr.query();
        if (gr.next())
            gr.deleteRecord();
        return false;
    },
	
	pollRegistration: function() {
        var app_id = this.getParameter('sysparm_app_id');
        var result = this.newItem("result");
        var deviceRegistration = new GlideRecord('sys_auth_policy_device_app_registry');
        deviceRegistration.addQuery('user', gs.getUserID());
        deviceRegistration.addQuery('is_registered', true);
        deviceRegistration.addQuery('active', true);
        deviceRegistration.addQuery('app_id', app_id);
        deviceRegistration.query();
        if (deviceRegistration.next()) {
            result.setAttribute("isRegistered", true);
            return 'true';
        } else {
            result.setAttribute("isRegistered", false);
            return 'false';
        }
	},

    type: 'GlideDeviceRegistration'
});
