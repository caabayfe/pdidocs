if (!pm.isZboot()) {
    var oAuthGR = new GlideRecord('oauth_entity');
    oAuthGR.get("be57bb02533102006b0fc91a8dc5877c");
    if (oAuthGR.isValidRecord() && isOauthUpdatedByUser(oAuthGR) && isOAuthActive(oAuthGR) && isClassicAppDisabled()) {
        gs.setProperty("glide.ui.m.allow_classic_mobile_app", true);
    }
}

function isClassicAppDisabled() {
    var classicAppProp = gs.getProperty("glide.ui.m.allow_classic_mobile_app");
    return !gs.nil(classicAppProp) && (classicAppProp == 'false' || classicAppProp == '0');
}

function isOAuthActive(oAuthGR) {
    return oAuthGR.getValue('active') == '1' || oAuthGR.getValue('active') == 'true';
}

function isOauthUpdatedByUser(oAuthGR) {
    return !sn_collision.CollisionAPI.willBeReplacedOnUpgrade(oAuthGR);
}
