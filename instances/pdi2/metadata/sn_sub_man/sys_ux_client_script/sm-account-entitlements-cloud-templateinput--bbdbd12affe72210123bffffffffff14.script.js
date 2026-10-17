/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const totalPurchasedScoreData = api.state.totalPoolPurchasedCapacityCount;
    const totalUsedScoreData = api.state.totalUsedPoolCapacity;
    const totalAvailableScoreData = api.state.availablePoolCapacity;
    const totalExcessScoreData = api.state.excessPoolCapacity;
    const showExcessScoreCard = Number(totalExcessScoreData) > 0;
    const summarySubTitle = api.data.get_customer_account_details_1.output.isSharedCapacityType === true ? helpers.translateSync("You purchased one or more instances each with an initial storage allotment.") : helpers.translateSync("You purchased a dedicated amount of storage for all of your instances to consume.");
    const instancesTableColumns = "instance,type,purpose,last_updated,used_pool_capacity";
    const instancesTableName = "sn_sub_man_st_cloud_entitlement_instance";
    const subscriptionsTableColumns = "product_code,product,type,start_date,end_date,purchased_quantity,capacity_per_unit_tb,total_purchased_pool_capacity_tb";
    const subscriptionsTableName = "sn_sub_man_st_cloud_entitlement_subscription";
    const subscriptionsTableDisplayFilter = "total_purchased_pool_capacity_tb!=0.0^ORDERBYDESCtotal_purchased_pool_capacity_tb";
    const instancesTableDisplayFilter = "ORDERBYdisplay_order";
    const data = {
        "flow": "cloudCapacity",
        "isDataSharingRestricted": api.state.isDataSharingRestricted,
        showExcessScoreCard,
        subscriptionsTableName,
        subscriptionsTableColumns,
        subscriptionsTableDisplayFilter,
        subscriptionsTableShowLastRefreshInfo: true,
        instancesTableName,
        instancesTableColumns,
        instancesTableDisplayFilter,
        instancesTableShowLastRefreshInfo: true,
        "firstTableColumns": "",
        "firstTableTitle": helpers.translateSync("Instances"),
        "mainErrorMessage": "",
        "mainSubTitle": "",
        "mainTitle": helpers.translateSync("Cloud capacity"),
        "secondTableColumns": "",
        "secondTableTitle": helpers.translateSync("Subsriptions"),
        "summaryHightlightedText": api.data.get_customer_account_details_1.output.capacityType,
        summarySubTitle,
        "summarySubTitleButtonText": api.state.cloudKBNumber,
        "kbUrl": api.state.cloudKBurl,
        "summaryTitle": helpers.translateSync("Account level summary"),
        "totalAvailableText": helpers.translateSync("Available pool capacity (TB)"),
        "totalExcessText": helpers.translateSync("Excess pool capacity (TB)"),
        "totalPurchasedText": helpers.translateSync("Total purchased pool capacity (TB)"),
        "totalUsedText": helpers.translateSync("Used pool capacity (TB)"),
        "summaryHightlightedTextIsSharedCapacity": api.data.get_customer_account_details_1.output.isSharedCapacityType,
        "firstRelatedLinkTitle": helpers.translateSync("Top 10 table view"),
        "secondRelatedLinkTitle": helpers.translateSync("Data management policy"),
        "firstRelatedLinkAddress": "./now/data-management-console/home",
        "secondRelatedLinkAddress": "./now/nav/ui/classic/params/target/sys_dm_policy_list.do%3Fsysparm_clear_stack%3Dtrue",
        totalPurchasedScoreData,
        totalUsedScoreData,
        totalAvailableScoreData,
        totalExcessScoreData
    };

    return data;
}
