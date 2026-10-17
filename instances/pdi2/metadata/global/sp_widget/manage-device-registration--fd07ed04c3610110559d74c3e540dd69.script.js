(function() {
    /* populate the 'data' object */
    /* e.g., data.table = $sp.getValue('table'); */

    data.authPolicyEnabled = gs.getProperty('glide.authenticate.auth.policy.enabled', 'false') == 'true';
    data.preauthAllowTrustedDevice = gs.getProperty('glide.authenticate.preauth.allow.trusted.device', 'false') == 'true';
    data.isImpersonating = new GlideImpersonate().isImpersonating();

    var grDeviceAggr = new GlideAggregate('sys_auth_policy_device_app_registry');
	if (grDeviceAggr.isValid()) {
		grDeviceAggr.addQuery('user', gs.getUserID());
		grDeviceAggr.addQuery('is_registered', true);
		grDeviceAggr.addQuery('active', true);
		data.deviceCount = grDeviceAggr.getCount();
	}

    var device = [];
    var grdevice = new GlideRecord('sys_auth_policy_device_app_registry');
    if (grdevice.isValid()) {
        grdevice.addQuery('user', gs.getUserID());
        grdevice.addQuery('is_registered', true);
		grdevice.addQuery('active', true);
        grdevice.query();
    }
    data.device_available = grdevice.hasNext();
    while (grdevice.next()) {
        var device_rec = {};
        device_rec.device_name = grdevice.getValue('device_name');
        device_rec.sys_id = grdevice.getValue('sys_id');
        device_rec.sys_created_on = grdevice.getValue('sys_created_on');
        device_rec.last_login_time = grdevice.getValue('last_login_time');
        device.push(device_rec);
    }
    data.device = device;



    if (input && input.action === 'remove_device') {
        new GlideDeviceRegistration().removeDeviceRegistration(input.sysId);
        return;
    }
	
	if (input && input.action === 'getMaxDeviceCount') {
        data.maxDeviceCount = gs.getProperty('glide.trusted.device.max.count', 3);
		data.deviceErrorMsg = gs.getMessage('You have already registered the maximum number of trusted devices. To register a new device, delete one of the existing devices.');
		return;
    }

    if (input && input.action === 'retrieve_device') {
        var grManageDevice = new GlideRecord('sys_auth_policy_device_app_registry');
        if (grManageDevice.isValid()) {
            grManageDevice.addQuery('sys_id', input.sysId);
            grManageDevice.addQuery('user', gs.getUserID());
            grManageDevice.query();
        }
        while (grManageDevice.next()) {
			data.device_name = grManageDevice.getValue('device_name');
        }
        return true;
    }

})();
