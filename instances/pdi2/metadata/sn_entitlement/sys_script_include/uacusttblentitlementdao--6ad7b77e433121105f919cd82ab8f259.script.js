var UACustTblEntitlementDAO = Class.create();
UACustTblEntitlementDAO.prototype = {
    initialize: function() {},
    insert: function(supportedAllotmentTypes) {
        var uaGR = new GlideRecord(LicensingEngineDBConstants.UA_CUST_TABLE_ENTITLEMENT);
        for (var i = 0; i < supportedAllotmentTypes.length; i++) {
            var query = LicensingEngineDBConstants.ALLOTMENT_TYPE + '=' + supportedAllotmentTypes[i] + '^EQ';
            uaGR.initialize();
            uaGR.addQuery(LicensingEngineDBConstants.NAME, LicensingEngineDBConstants.UA_CUSTOM_TABLE_INVENTORY);
            uaGR.addQuery(LicensingEngineDBConstants.TABLE_NAME_ATTR, LicensingEngineDBConstants.TABLE_NAME);
            uaGR.addQuery(LicensingEngineDBConstants.QUERY, query);
            uaGR.query();
            if (!uaGR.next()) {
                uaGR.setValue(LicensingEngineDBConstants.NAME, LicensingEngineDBConstants.UA_CUSTOM_TABLE_INVENTORY);
                uaGR.setValue(LicensingEngineDBConstants.TABLE_NAME_ATTR, LicensingEngineDBConstants.TABLE_NAME);
                uaGR.setValue(LicensingEngineDBConstants.QUERY, query);
                uaGR.insert();
            }
        }
    },
    type: 'UACustTblEntitlementDAO'
};
