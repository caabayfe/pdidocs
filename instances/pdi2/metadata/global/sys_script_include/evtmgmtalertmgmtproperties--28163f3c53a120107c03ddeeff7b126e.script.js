var EvtMgmtAlertMgmtProperties = Class.create();
EvtMgmtAlertMgmtProperties.prototype = {
    type: 'EvtMgmtAlertMgmtProperties',
    initialize: function() {},
};

EvtMgmtAlertMgmtProperties.isARMScopedAppActive = function() {
    return EvtMgmtAlertMgmtProperties.get('evt_mgmt.alert_management_scoped_active', 'false') === 'true';
};

EvtMgmtAlertMgmtProperties.setARMScopedActiveProperty = function(value) {
    return EvtMgmtAlertMgmtProperties.set('evt_mgmt.alert_management_scoped_active', value);
};


EvtMgmtAlertMgmtProperties.get = function(property, defaultValue) {
    if (typeof property === 'string') {
        return (typeof defaultValue !== 'undefined') ? gs.getProperty(property, defaultValue) : gs.getProperty(property);
    }
};

EvtMgmtAlertMgmtProperties.set = function(property, value) {
    if ((typeof property === 'string') && (typeof value !== 'undefined')) {
        gs.setProperty(property, value);
        return true;
    }
    return false;
};
