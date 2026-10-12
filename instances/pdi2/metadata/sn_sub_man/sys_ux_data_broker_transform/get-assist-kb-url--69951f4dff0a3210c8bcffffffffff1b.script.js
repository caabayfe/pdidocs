function transform() {
    const defaulKBValue = {
        url: "",
        label: ""
    };

    const subscriptionEntitlementGR = new GlideRecord(sn_entitlement.LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
    subscriptionEntitlementGR.addQuery("meter_type", "Assist");
    subscriptionEntitlementGR.addQuery("status", "!=", "1");
    subscriptionEntitlementGR.addQuery("definition_id", "!=", "");
    subscriptionEntitlementGR.addNotNullQuery("definition_id");
    subscriptionEntitlementGR.setLimit(1);
    subscriptionEntitlementGR.query();

    if (!(subscriptionEntitlementGR.next())) {
        return defaulKBValue;
    }

    const uaDefnBaseGR = new GlideRecord("ua_defn_base");
    uaDefnBaseGR.addQuery("definition_id", subscriptionEntitlementGR.getValue("definition_id"));
    uaDefnBaseGR.addNotNullQuery("kb_article_url");
    uaDefnBaseGR.query();

    if (!(uaDefnBaseGR.next() && uaDefnBaseGR.getValue("kb_article_url").indexOf('sysparm_article=') !== -1)) {
        return defaulKBValue;
    }


    const url = uaDefnBaseGR.getValue("kb_article_url");
    const label = url.split('sysparm_article=')[1].split('&')[0];

    return {
        url,
        label
    };

}
