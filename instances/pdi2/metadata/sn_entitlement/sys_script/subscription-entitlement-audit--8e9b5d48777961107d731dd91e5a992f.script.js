var auditHelper = new EntitlementAuditHelper();
var operation = current.operation();

if (operation == "insert") {

    auditHelper.recordSubscriptionAdded(current);

} else if (operation == "update") {

    if (isSubscriptionInactivated())
        auditHelper.recordSubscriptionInactivated(current, previous);
    else if (isSubscriptionExpired())
        auditHelper.recordSubscriptionExpired(current, previous);
    else
        auditHelper.recordSubscriptionUpdated(current, previous);

}

/**
 * The function checks if the status of the subscription was changed from Active to Inactive
 * with this update.
 *
 * @returns {boolean} is Subscription Inactivated
 */
function isSubscriptionInactivated() {
    if (current.status == LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT_INACTIVE &&
        previous.status == LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT_ACTIVE)
        return true;

    return false;
}

/**
 * The function checks if the status of the subscription was changed from Active to Expired
 * with this update.
 *
 * @returns {boolean} is Subscription Expired
 */
function isSubscriptionExpired() {
    if (current.status == LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT_EXPIRED &&
        previous.status == LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT_ACTIVE)
        return true;

    return false;
}
