(function executeRule(current, previous /*null when async*/) {
var familyId = "platform_email_approver";
var emailEntitlement = null;

var isPropertyEnabled = GlideProperties.getBoolean('enable.approval.entitlement', false); 
if (isPropertyEnabled) {
    try {
        if (familyId) {
            emailEntitlement = new sn_lef.GlideLicenseAPI().hasLicenseForFeature("family_id", familyId);
        }

        var isEntitled = new ApprovalEntitlementUtil().onCreateApproval(current.approver, current.source_table);

        if (!isEntitled) {
            current.state = 'not_entitled';
        }
    }
    catch (e) {
        gs.log("Error with ApprovalEntitlementUponCreation BR: GlideLicenseAPI failure.");
    }
}
})(current, previous);
