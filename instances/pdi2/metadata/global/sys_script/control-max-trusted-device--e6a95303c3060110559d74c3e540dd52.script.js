(function executeRule(current, previous /*null when async*/ ) {

    var grDeviceAggr = new GlideAggregate('sys_auth_policy_device_app_registry');
    var maxDeviceCount = gs.getProperty('glide.trusted.device.max.count', 3);
    var deviceCount = 0;
    if (grDeviceAggr.isValid()) {
        grDeviceAggr.addQuery('user', current.user);
        grDeviceAggr.addQuery('is_registered', true);
        grDeviceAggr.addQuery('active', true);
        deviceCount = grDeviceAggr.getCount();
    }
    if (deviceCount >= maxDeviceCount) {
        gs.addErrorMessage(gs.getMessage('Maximum {0} devices allowed for a user to be registered. To register a new device, delete one of the existing devices.', maxDeviceCount));
        current.setAbortAction(true);
    }
})(current, previous);
