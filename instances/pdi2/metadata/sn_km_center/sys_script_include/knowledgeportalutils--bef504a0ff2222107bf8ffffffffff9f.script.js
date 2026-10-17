var KnowledgePortalUtils = Class.create();
KnowledgePortalUtils.prototype = {
    initialize: function() {},
    isAisEnabledInKBPortal: function() {
        var KB_PORTAL_ID = "45d6680fdb52220099f93691f0b8f5ad";
        try {
            var kbPortalGr = new GlideRecordSecure("sp_portal");
            if (kbPortalGr.get(KB_PORTAL_ID)) {
                // Directly check the boolean field value
                return !!kbPortalGr.enable_ais;
            }
            return false; // portal not found
        } catch (e) {
            gs.error("Error checking AI Search status for KB Portal (isAisEnabledInKBPortal): " + e.getMessage());
            return false;
        }
    },

    type: 'KnowledgePortalUtils'
};
