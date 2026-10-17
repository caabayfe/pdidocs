/**
 * Data broker to get total purchase count for GenAI products
 * @return {number} custom application count
 */
function transform() {
    var totalPurchaseCount = 0;

    // get total purchase count for all the GenAI products
    var gr = new GlideRecord('subscription_entitlement');
    gr.addQuery(sn_entitlement.LicensingEngineDBConstants.STATUS, sn_entitlement.LicensingEngineDBConstants.IN, sn_entitlement.LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);
    // entitlement_type=0 -> primary subscription, entitlement_type=1 -> secondary metered subscription
    gr.addEncodedQuery('entitlement_type=0^ORentitlement_type=1^meter_type=assist');
    gr.query();
    while (gr.next()) {
        var purchaseCount = parseInt(gr.getValue('purchased_count'));
        totalPurchaseCount = purchaseCount + totalPurchaseCount;
    }

    return totalPurchaseCount;
}
