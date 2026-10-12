(function executeRule(current, previous /*null when async*/ ) {
    /** 
     * status of classic app entity should be in sync with property                 
     * (glide.ui.m.allow_classic_mobile_app), in case user tries 
     * overriding and enable app manually 
     **/

    // by default assume classic app is enabled (if property is not defined)
    var allowClassicApp = "true";
    var sysPropGR = new GlideRecord("sys_properties");
    sysPropGR.addQuery("name", "glide.ui.m.allow_classic_mobile_app");
    sysPropGR.query();
    if (sysPropGR.next()) {
        allowClassicApp = sysPropGR.getValue("value");
        allowClassicApp = gs.nil(allowClassicApp) ? "true" : allowClassicApp;
        var classicAppStatusMisMatch = allowClassicApp == "false" && current.active == 1 ||
            allowClassicApp == "true" && current.active == 0;

        //if status mismatch update OAuth entity
        if (classicAppStatusMisMatch) {
            gs.log("Classic app status mismatch glide.ui.m.allow_classic_mobile_app : " + allowClassicApp + " OAuth entry active : " + current.active);
            //this can possible fire one additional call to this business rule (when mismatch happens)
            var oAuthEntityGR = new GlideRecord('oauth_entity');
            //sys_id for ServiceNow Classic Mobile App
            oAuthEntityGR.get("be57bb02533102006b0fc91a8dc5877c");
            if (allowClassicApp == "true") {
                oAuthEntityGR.setValue('active', 1);
            } else {
                oAuthEntityGR.setValue('active', 0);
            }
            oAuthEntityGR.update();
        }
    }

    if (allowClassicApp == "false") {
        //expire register app tokens
        var oAuthGR = new GlideRecord('oauth_credential');
        oAuthGR.addQuery("peer", current.sys_id);
        oAuthGR.query();
        var expires = new GlideDateTime();
        while (oAuthGR.next()) {
            oAuthGR.setValue('expires', expires);
            oAuthGR.update();
        }

        //un-register push notification for classic app
        var pushNotifGR = new GlideRecord('sys_push_notif_app_install');
        pushNotifGR.addQuery("sys_push_application_id", "ab704041ff1102009738ffffffffff33");
        pushNotifGR.addQuery("active", 1);
        pushNotifGR.query();
        while (pushNotifGR.next()) {
            pushNotifGR.setValue('active', 0);
            pushNotifGR.update();
        }
    }
})(current, previous);
