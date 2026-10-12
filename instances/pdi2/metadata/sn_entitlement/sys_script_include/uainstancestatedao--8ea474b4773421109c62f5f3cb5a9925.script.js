var UAInstanceStateDAO = Class.create();
UAInstanceStateDAO.prototype = {
    initialize: function() {},

    isCommunicationAlive: function() {
        var instGR = new GlideRecord(LicensingEngineDBConstants.UA_INSTANCE_STATE);
        if (instGR.isValid()) {
            instGR.query();
            if (instGR.isValidField(LicensingEngineDBConstants.CENTRAL_COMM) && instGR.next()) {
                var centralCommAlive = instGR.getValue(LicensingEngineDBConstants.CENTRAL_COMM);
                return centralCommAlive === LicensingEngineConstants.TRUE_ONE || centralCommAlive === LicensingEngineConstants.TRUE;
            }
        }
        return false;
    },

    isInstanceStateOpen: function() {
        var instGR = new GlideRecord(LicensingEngineDBConstants.UA_INSTANCE_STATE);
        if (instGR.isValid()) {
            instGR.query();
            if (instGR.isValidField(LicensingEngineDBConstants.STATE) && instGR.next())
                return instGR.getValue(LicensingEngineDBConstants.STATE) === LicensingEngineDBConstants.OPEN;
        }
        return false;
    },

    isProductionInstance: function() {
        var instGR = new GlideRecord(LicensingEngineDBConstants.UA_INSTANCE_STATE);
        instGR.query();
        if (instGR.isValidField(LicensingEngineDBConstants.INSTANCE_USED_FOR) && instGR.next())
            return instGR.getValue(LicensingEngineDBConstants.INSTANCE_USED_FOR) === LicensingEngineConstants.PRODUCTION;
        return false;
    },

    isServiceNowInstance: function() {
        // Try KAA profile first when available
        try {
            const kaaProfile = sn_kmf.GlideKaaProfileFactory.getCurrentInstanceKaaProfile();
            return gs.nil(kaaProfile) || kaaProfile.getCustomerId() === "ServiceNow" || /service-?now.*/i.test(kaaProfile.getCustomerId());
        } catch (e) {
            gs.info("Can't access KAA profile. Fall back to ua_instance_state");
        }
        
        // Fallback to ua_instance_state table
        const gr = new GlideRecord(LicensingEngineDBConstants.UA_INSTANCE_STATE);
        gr.query();

        return (gr.isValidField(LicensingEngineDBConstants.INSTANCE_COMPANY) &&
            gr.next() &&
            gr.getValue(LicensingEngineDBConstants.INSTANCE_COMPANY) == "Service-now.com");
    },

    type: 'UAInstanceStateDAO'
};
