/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const totalPoolPurchasedCapacityCount = api.data.get_customer_account_details_1.output.totalPoolPurchasedCapacityCount;
    const totalUsedPoolCapacity = api.data.get_customer_account_details_1.output.totalUsedPoolCapacity;
    const availablePoolCapacity = api.data.get_customer_account_details_1.output.availablePoolCapacity;
    const excessPoolCapacity = api.data.get_customer_account_details_1.output.excessPoolCapacity;
    const isOverage = api.data.get_customer_account_details_1.output.isOverage;
    const isDataSharingRestricted = api.data.get_customer_account_details_1.output.isDataSharingRestricted;
    const showCloudEntitlement = api.data.get_customer_account_details_1.output.showCloudEntitlement;
    // save count to state
    api.setState('totalPoolPurchasedCapacityCount', totalPoolPurchasedCapacityCount);
    api.setState('totalUsedPoolCapacity', totalUsedPoolCapacity);
    api.setState('availablePoolCapacity', availablePoolCapacity);
    api.setState('excessPoolCapacity', excessPoolCapacity);
    api.setState('isOverage', isOverage);
    api.setState('isDataSharingRestricted', isDataSharingRestricted);
    api.setState('shouldShowCloudEntitlementTab', showCloudEntitlement);
}
