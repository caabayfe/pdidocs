/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const allocationVisible = api.data.getallocationvisibiltystatus_1.output;
    const totalPurchasedScoreData = api.state.creatorPurchasedCount;
    const totalUsedScoreData = allocationVisible ? api.state.creatorAllocatedCount : '-';
    const totalAvailableScoreData = allocationVisible ? api.state.creatorAvailableCount : '-';
    const totalExcessScoreData = api.state.creatorOverconsumedCount;
    const showExcessScoreCard = Number(totalExcessScoreData) > 0 && allocationVisible;
    const instancesTableName = "sn_sub_man_st_now_assist_creator_instances";
    const instancesTableColumns = "name,type,last_updated,allocated_users";
    const subscriptionsTableName = "subscription_detail";
    const subscriptionsTableFilter = "subscription.meter_type=creator^is_latest=true";
    const subscriptionsTableColumns = "subscription,subscription.start_date,subscription.end_date,subscription.purchased_count";
    const mainInfoMessage = helpers.translateSync("Demonstration instance user consumptions are excluded from the aggregation of Creator user consumption for an account.");
    const perUserInfoMessage = helpers.translateSync('For usage questions regarding "Per-User" products, please reach out to your Account Executive.')
    const perUserInfoMessageObj = {
        message: perUserInfoMessage,
        level: 'info',
        link: {},
        action: {}
    }

    const data = {
        "flow": "creator",
        "isDataSharingRestricted": api.state.hasCreatorDataSharingInstances,
        infoMessageArray: [perUserInfoMessageObj],
        instancesTableName,
        instancesTableColumns,
        instancesTableShowLastRefreshInfo: false,
        subscriptionsTableName,
        subscriptionsTableFilter,
        subscriptionsTableColumns,
        subscriptionsTableShowLastRefreshInfo: false,
        showExcessScoreCard,
        "firstTableColumns": "",
        "firstTableTitle": helpers.translateSync("Instances"),
        "mainErrorMessage": "",
        "mainSubTitle": helpers.translateSync("View the total number of Now Assist creator entitlements purchased across all your instances and track consumption for distinct users."),
        "mainTitle": helpers.translateSync("Now Assist creators"),
        "secondTableColumns": "",
        "secondTableTitle": helpers.translateSync("Subsriptions"),
        "summaryHightlightedText": "",
        "summarySubTitle": "",
        "summaryTitle": helpers.translateSync("Account-level summary"),
        "totalAvailableText": helpers.translateSync("Available"),
        "totalExcessText": helpers.translateSync("Over consumed"),
        "totalPurchasedText": helpers.translateSync("Total purchased"),
        "totalUsedText": helpers.translateSync("Distinct users"),
        "totalUsedCardTooltip": helpers.translateSync("Deduplicated Creator Plus consumption across instances. Recent usage may take up to 48 hours."),
        "summaryHightlightedTextIsSharedCapacity": api.data.get_customer_account_details_1.output.isSharedCapacityType,
        "firstRelatedLinkTitle": helpers.translateSync("Top 10 table view"),
        "secondRelatedLinkTitle": helpers.translateSync("Data management policy"),
        "firstRelatedLinkAddress": "./now/data-management-console/home",
        "secondRelatedLinkAddress": "./now/nav/ui/classic/params/target/sys_dm_policy_list.do%3Fsysparm_clear_stack%3Dtrue",
        totalPurchasedScoreData,
        totalUsedScoreData,
        totalAvailableScoreData,
        totalExcessScoreData,
        hideRelatedLinks: true,
        subscriptionsTableHideLinks: false,
        instancesTableDisplayFilter: "ORDERBYdisplay_order",
        mainInfoMessage
    };
    return data;
}
