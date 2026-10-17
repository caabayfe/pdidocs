(function executeRule(current, previous /*null when async*/) {
var familyId = "platform_email_approver";
var emailEntitlement = null;

var isPropertyEnabled = GlideProperties.getBoolean('enable.approval.entitlement', false); 
if (isPropertyEnabled) {
    try {
        if (familyId) {
            emailEntitlement = new sn_lef.GlideLicenseAPI().hasLicenseForFeature("family_id", familyId);
        }
        var isEntitled = new ApprovalEntitlementUtil().onAdjudicateApproval(current.approver, current.source_table);
    }
    catch (e) {
        gs.log("Error with ApprovalEntitlementUponAdjudication BR: GlideLicenseAPI failure.");
    }
}
})(current, previous);
