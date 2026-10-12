(function() {
    // Based on analytics properties update the consent policies for all countries
    // glide.analytics.user.consent.popup.disabled true and glide.analytics.user.auto.consent
    var USER_CONSENT_POPUP_DISABLED = 'glide.analytics.user.consent.popup.disabled';
    var userConsentPopupDisabledGR = new GlideRecord('sys_properties');
    userConsentPopupDisabledGR.addQuery('name', USER_CONSENT_POPUP_DISABLED);
    userConsentPopupDisabledGR.query();
    var foundUserConsentPopupDisabledProp = userConsentPopupDisabledGR.next();
    var userConsentPopupDisabledValue = userConsentPopupDisabledGR.getValue("value");
    if (foundUserConsentPopupDisabledProp) {
        gs.info("Property Found: " + USER_CONSENT_POPUP_DISABLED + " with value: " + userConsentPopupDisabledValue);
    } else {
        gs.info("Property Not Found: " + USER_CONSENT_POPUP_DISABLED);
    }

    var USER_AUTO_CONSENT = 'glide.analytics.user.auto.consent';
    var userAutoConsentGR = new GlideRecord('sys_properties');
    userAutoConsentGR.addQuery('name', USER_AUTO_CONSENT);
    userAutoConsentGR.query();
    var foundUserAutoConsentProp = userAutoConsentGR.next();
    var userAutoConsentValue = userAutoConsentGR.getValue("value");
    if (foundUserAutoConsentProp) {
        gs.info("Property Found: " + USER_AUTO_CONSENT + " with value: " + userAutoConsentValue);
    } else {
        gs.info("Property Not Found: " + USER_AUTO_CONSENT);
    }

    if (foundUserConsentPopupDisabledProp && userConsentPopupDisabledValue === "true") {
        if (foundUserAutoConsentProp && userAutoConsentValue === "true") {
                // All countries will be updated to "No Consent Required" Consent Policy
                var gr = new GlideRecord("core_country");
                gr.addNullQuery("analytics_consent_policy");
                gr.setValue("analytics_consent_policy", "ef0bb519773311105679bcc8ca5a99ad");
                gr.updateMultiple();
                gs.info("Updated All countries consent policy to 'No Consent Required'");
            } else {
                // All countries will be updated to "Disabled" Consent Policy
                var gr = new GlideRecord("core_country");
                gr.addNullQuery("analytics_consent_policy");
                gr.setValue("analytics_consent_policy", "618a7d12779021105679bcc8ca5a9970");
                gr.updateMultiple();
                gs.info("Updated All countries consent policy to 'Disabled'");
            }
    } else {
        gs.info("Since Property: " + USER_CONSENT_POPUP_DISABLED + " has value: " + userConsentPopupDisabledValue + " Region specfic default consent policies will be applied.");

        // European Countries will be updated to "Explicit Op In" Consent Policy
        var gr = new GlideRecord("core_country");
        gr.addNullQuery("analytics_consent_policy");
        // Austria, Belgium, Bulgaria, Croatia, Cyprus, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary,
        // Ireland, Italy, Latvia, Lithuania, Luxembourg, Malta, Netherlands, Poland, Portugal, Romania, Slovakia, Slovenia, Spain, Sweden,
        // United Kingdom, Iceland, Liechtenstein, Norway, Switzerland
        gr.addQuery("iso3166_2", "IN", ["AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "GB", "IS", "LI", "NO", "CH"]);
        gr.setValue("analytics_consent_policy", "87f9b519773311105679bcc8ca5a9922");
        gr.updateMultiple();
        gs.info("European Countries will be updated to 'Explicit Op In' Consent Policy");

        // United States will be updated to "No Consent Required" Consent Policy
        var gr = new GlideRecord("core_country");
        gr.addNullQuery("analytics_consent_policy");
        gr.addQuery("iso3166_2", "=", "US");
        gr.query();
        gr.next();
        gr.setValue("analytics_consent_policy", "ef0bb519773311105679bcc8ca5a99ad");
        gr.update();
        gs.info("United States will be updated to 'No Consent Required' Consent Policy");

        // Rest All Countries will be updated to "Notice" Consent Policy
        var gr = new GlideRecord("core_country");
        gr.addNullQuery("analytics_consent_policy");
        gr.setValue("analytics_consent_policy", "562bf159773311105679bcc8ca5a9983");
        gr.updateMultiple();
        gs.info("Rest of the Countries will be updated to 'Notice' Consent Policy");
    }

    if (foundUserConsentPopupDisabledProp) {
        userConsentPopupDisabledGR.deleteRecord();
        gs.info("Property deleted: " + USER_CONSENT_POPUP_DISABLED);
    }

    if (foundUserAutoConsentProp) {
        userAutoConsentGR.deleteRecord();
        gs.info("Property deleted: " + USER_AUTO_CONSENT);
    }
})();
