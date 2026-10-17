/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const totalPurchasedScoreData = api.state.assistPurchasedCount;
    const totalUsedScoreData = api.state.assistAllocatedCount;
    const totalAvailableScoreData = api.state.assistAvailableCount;
    const totalExcessScoreData = api.state.assistOverconsumedCount;
    const showExcessScoreCard = Number(totalExcessScoreData) > 0;
    const assistKbUrl = api.data.get_assist_kb_url_1.output.url;
    const assistKBLabel = api.data.get_assist_kb_url_1.output.label;
    const instancesTableName = "sn_sub_man_st_instance_used_assist_count";
    const instancesTableFilter = "";
    const instancesTableColumns = "name,type,accrual_time,used_assists";
    const instancesTableDisplayFilter = "ORDERBYdisplay_order";
    const subscriptionsTableName = "sn_entitlement_account_nowassist_purchased";
    const subscriptionsTableFilter = "status=active^ORstatus=expired";
    const subscriptionsTableColumns = "product_name,meter_type,entitlement_type,start_date,end_date,purchased_count";
    const subscriptionsTableDisplayFilter = "ORDERBYDESCend_date^ORDERBYDESCstart_date";
    const domainTableName = "now_assists_domains";
    const domainTableFilter = "accrual_time=" + api.data.domain_assist_max_accrual_time.output.data.GlideAggregate_Query[0].max;
    const domainTableColumns = "name,accrual_time,used_assists";
    const domainTableDisplayFilter = "";
    const domainTableTitle = "Domains";
    const skillsTableName = "sn_sub_man_st_now_assists_aggregate";
    const skillsTableFilter = "";
    const skillsTableColumns = "skills,accrual_time,no_of_actions,assist_ratio,total_assists";
    const skillsTableDisplayFilter = "";
    const instanceNameResults = api.data.lookup_instance_name_property.output.properties.instance_name;
    const skillsTableTitle = instanceNameResults ? helpers.translateSync('Assists usage details for {0}', instanceNameResults) : '';
    const instanceName = instanceNameResults ? helpers.translateSync('Current {0} details', instanceNameResults) : '';
    const utilizationHistoryText = instanceNameResults ? helpers.translateSync('Assists utilization history for {0}', instanceNameResults) : '';
    const showDomainTable = api.state.showDomainList;
    const mainErrorMessage = api.state.assistInstanceList;
    const mainInfoMessage = "";
    const data = {
        "flow": "assist",
        "isDataSharingRestricted": api.state.hasAssistDataSharingInstances,
        instancesTableName,
        instancesTableFilter,
        instancesTableColumns,
        instancesTableDisplayFilter,
        instancesTableShowLastRefreshInfo: false,
        subscriptionsTableName,
        subscriptionsTableFilter,
        subscriptionsTableColumns,
        subscriptionsTableDisplayFilter,
        subscriptionsTableShowLastRefreshInfo: false,
        showExcessScoreCard,
        "firstTableTitle": helpers.translateSync("Instances"),
        "mainErrorMessage": "",
        "mainSubTitle": helpers.translateSync("View a summary of your Now Assist entitlements and track Now Assist usage across all your instances."),
        "mainTitle": helpers.translateSync("Now Assist usage"),
        "secondTableTitle": helpers.translateSync("Subsriptions"),
        "summaryHightlightedText": "",
        "summarySubTitle": "",
        "summaryTitle": helpers.translateSync("Account-level summary"),
        "totalAvailableText": helpers.translateSync("Available assists"),
        "totalExcessText": helpers.translateSync("Excess used assists"),
        "totalPurchasedText": helpers.translateSync("Total purchased"),
        "totalUsedText": helpers.translateSync("Total used assists"),
        "totalUsedCardTooltip": helpers.translateSync("The current estimate of total Now Assist usage across all your instances. This value may not reflect the total usage from every instance due to a synchronization delay."),
        "firstRelatedLinkTitle": helpers.translateSync("AI Agent Analytics Dashboard"),
        "firstRelatedLinkAddress": "./now/platform-analytics-workspace/dashboards/params/edit/false/sys-id/370f503383721210bf0991b0222bc094",
        "secondRelatedLinkTitle": "",
        totalPurchasedScoreData,
        totalUsedScoreData,
        totalAvailableScoreData,
        totalExcessScoreData,
        hideRelatedLinks: false,
        subscriptionsTableHideLinks: true,
        domainTableName,
        domainTableFilter,
        domainTableTitle,
        domainTableColumns,
        domainTableDisplayFilter,
        skillsTableName,
        skillsTableFilter,
        skillsTableColumns,
        skillsTableDisplayFilter,
        skillsTableTitle,
        instanceName,
        utilizationHistoryText,
        showDomainTable,
        mainErrorMessage,
        mainInfoMessage,
        assistKbUrl,
        assistKBLabel
    };

    return data;
}
