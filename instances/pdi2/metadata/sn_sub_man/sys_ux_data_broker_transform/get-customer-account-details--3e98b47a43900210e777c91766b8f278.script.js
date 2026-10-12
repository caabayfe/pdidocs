/*
Returns: 
    Account ID, Account Name, Instance name, Capacity type, instance id, is subprod instance, total used pool capacity.

*/
function transform(input) {
    const accountDetails = {};

    const cloudEntitlementDetailDAO = new CloudEntitlementDetailDAO();
    const cloudStorageAccountConsumptionService = new CloudStorageAccountConsumptionService();
    const cloudStorageInstanceConsumptionDAO = new CloudStorageInstanceConsumptionDAO();
    const isSharedCapacityType = cloudEntitlementDetailDAO.isSharedCapacityType();
    accountDetails.showCloudEntitlement = cloudEntitlementDetailDAO.showCloudEntitlement();
    accountDetails.isSharedCapacityType = isSharedCapacityType;
    accountDetails.capacityType = cloudStorageAccountConsumptionService.getCapacityType(isSharedCapacityType);
    accountDetails.totalUsedPoolCapacity = cloudStorageAccountConsumptionService.getTotalUsedPoolCapacity();
    accountDetails.totalPoolPurchasedCapacityCount = cloudStorageAccountConsumptionService.getTotalPoolPurchasedCapacityCount();

    accountDetails.isOverage = ((accountDetails.totalUsedPoolCapacity - accountDetails.totalPoolPurchasedCapacityCount) > 0) ? true : false;

    accountDetails.availablePoolCapacity = cloudStorageAccountConsumptionService.getAvailablePoolCapacity(accountDetails.totalPoolPurchasedCapacityCount, accountDetails.totalUsedPoolCapacity, accountDetails.isOverage);
    accountDetails.excessPoolCapacity = cloudStorageAccountConsumptionService.getExcessPoolCapacity(accountDetails.totalPoolPurchasedCapacityCount, accountDetails.totalUsedPoolCapacity, accountDetails.isOverage);

    accountDetails.isDataSharingRestricted = cloudEntitlementDetailDAO.isDataSharingRestricted();

	accountDetails.defnID = cloudEntitlementDetailDAO.getDefinitionID();

    return accountDetails;
}
