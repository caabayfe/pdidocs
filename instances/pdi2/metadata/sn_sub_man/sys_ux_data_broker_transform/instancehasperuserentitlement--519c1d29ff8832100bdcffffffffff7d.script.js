function transform() {
    var gr = new GlideRecord(sn_entitlement.LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
    gr.addQuery("subscription_type", 0);
    gr.setLimit(1);
    gr.query();
    return gr.hasNext();
}
