var GlideEntitlementAjax = Class.create();

GlideEntitlementAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    hasCapacityTypeEntitlements: function() {
        var canRouteToEMS = new SubscriptionEntitlementsService().canRouteToEMS();
        var appId = this.getParameter("app_id");
        var appEntTable;
        var appIdField;
        var entTypeField;
        if (!canRouteToEMS) {
            appEntTable = "license_has_app";
            appIdField = "app.app_id";
            entTypeField = "license.license_type";
        } else {
            appEntTable = "subscription_has_app";
            appIdField = "application.app_id";
            entTypeField = "subscription.subscription_type";
        }

        var appEntGR = new GlideRecord(appEntTable);
        appEntGR.addQuery(appIdField, appId);
        appEntGR.addQuery(entTypeField, "1"); // capacity type of license : 1
        appEntGR.query();
        var responseObj = {
            "hasCapacityTypeEntitlement": appEntGR.hasNext()
        };
        return JSON.stringify(responseObj);
    },

    type: "GlideEntitlementAjax"
});
