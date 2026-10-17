function onLoad() {
    hideRelatedList();
}

function getProperty(property, defaultValue) {
    var propGR = new GlideRecord("sys_properties");
    propGR.addQuery("name", property);
    propGR.query();
    return propGR.next() ? propGR.getValue("value") : defaultValue;
}

function hideRelatedList() {
    var appId;
    var sysId = g_form.getUniqueValue();
    var gr = new GlideRecord("ua_app_family");
    if(gr.get(sysId)){
        appId = gr.getValue("app_id");
    }
    var canRouteToEMS = getProperty("glide.entitlement.surf.routing", "true") === "false" && getProperty("glide.entitlement.ems.data.available", "false") === "true";
    if (!canRouteToEMS) {
        // for customers without SMv2 installed we'll still need to query the tables directly as 
        // the script sn_entitlement.GlideEntitlementAjax will not be present in the system
        var lhaGR = new GlideRecord("license_has_app");
        lhaGR.addQuery("license.license_type", "1"); // capacity type license : 1
        lhaGR.addQuery("app.app_id", appId);
        lhaGR.query();
        if (lhaGR.hasNext())
            g_form.hideRelatedList('REL:002a71cd93820300972c990f867ffb92_list'); //Associated Roles
        else
            g_form.showRelatedList('REL:002a71cd93820300972c990f867ffb92_list');
    } else {
        var ajax = new GlideAjax("sn_entitlement.GlideEntitlementAjax");
        ajax.addParam("sysparm_name", "hasCapacityTypeEntitlements");
        ajax.addParam("app_id", appId);
        ajax.getXMLAnswer(shouldHide);
    }
}

function shouldHide(entitlementInfo) {
    entitlementInfo = JSON.parse(entitlementInfo);
    // if the app is associated with atleast one capacity type of subscription then hide the related list
    if (entitlementInfo["hasCapacityTypeEntitlement"] == "true" || entitlementInfo["hasCapacityTypeEntitlement"] == true)
        g_form.hideRelatedList('REL:002a71cd93820300972c990f867ffb92_list'); //Associated Roles
    else
        g_form.showRelatedList('REL:002a71cd93820300972c990f867ffb92_list');
}
