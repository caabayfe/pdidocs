var ApprovalEntitlementUtil = Class.create();
ApprovalEntitlementUtil.prototype = {
    initialize: function () { },

    //on create approval, return the entitlement status returned by licensing API here
    onCreateApproval: function (usersysid, tablename) {
        try {
            var isEntitled = new sn_lef.GlideLicenseAPI().canUserApproveOnTable(usersysid, tablename);
            return isEntitled;
        }
        catch (e) {
            gs.log("Error with onCreateApproval: GlideLicenseAPI failure.");
        }
    },

    //on adjudicate approval, return the entitlement status returned by licensing API here
    onAdjudicateApproval: function (usersysid, tablename) {
        try {
            var isEntitled = new sn_lef.GlideLicenseAPI().enableEntitlementLogging().canUserApproveOnTable(usersysid, tablename);
            return isEntitled;
        }
        catch (e) {
            gs.log("Error with onAdjudicateApproval: GlideLicenseAPI failure.");
        }
    },
    type: 'ApprovalEntitlementUtil'
};
