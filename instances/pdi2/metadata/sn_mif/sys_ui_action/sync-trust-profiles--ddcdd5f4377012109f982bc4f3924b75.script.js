syncTrustProfile();

function syncTrustProfile() {
    var appId = current.application;
    var mgr = new sn_mif_core.MIFTrustProfile();
    var res = mgr.applyTrustProfile(appId); // returns a native object

    if (res.status == "APPLIED") {
        gs.addInfoMessage(res.info);
    } else if (res.status == "PARTIALLY_APPLIED") {
        gs.addErrorMessage(res.info);
    } else if (res.status == "ERROR") {
        gs.addErrorMessage(res.info);
    }

    action.setRedirectURL("sn_mif_application_trust_profile.do?sys_id=" + appId);
}
