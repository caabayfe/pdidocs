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
    // donutChart expects the data in this format
    const donutDataObj = {
        "data": [],
        "metadata": {
            "eventData": {},
            "dataSourceLabel": "Allocation_data",
            "groupBy": [{
                "series": [{}],
                "elements": [],
                "label": "Count",
                "id": "count_group",
                "fieldType": "reference"
            }]
        }
    };

    // variables needed to construct donutChart data
    const dataObj = [];
    const allocatedObj = {
        "count_group": api.state.allocatedText,
        "value": 0
    };
    const availableObj = {
        "count_group": api.state.availableText,
        "value": 0
    };
    const overAllocatedObj = {
        "count_group": api.state.overAllocatedText,
        "value": 0
    };

    function log(msg) {
        // for debugging
        //console.log("[getDonutData] " + msg);
    }

    // data
    let allocatedCount = 0;
    let purchasedCount = 0;
    let status = "";
    
    if (api.state.isMeterTypeCreator) {
        if (api.data.account_level_entitlements_creator.output == null) return;
        const accountEnt = api.data.account_level_entitlements_creator.output.data.GlideRecord_Query.sn_sub_man_st_account_level_entitlement;
        if (accountEnt._rowCount == 0 || !accountEnt._results || accountEnt._results.length == 0) {
            log("No sn_sub_man_st_account_level_entitlement record found for creator meter-type");
            return;
        }

        const creatorRow = accountEnt._results[0];
        allocatedCount = Number(creatorRow.allocated_count.value);
        purchasedCount = Number(creatorRow.purchased_count.value);
        status = creatorRow.status.value;
    } else {
        allocatedCount = Number(api.data.sub_detail_record.results[0].allocated_count.value);
        purchasedCount = Number(api.data.sub_detail_record.results[0].subscription._reference.purchased_count.value);
        status = api.data.sub_detail_record.results[0].status.value;
    }

    switch (status) {
        case 'under':
        case 'even':
        case 'near':
            allocatedObj.value = allocatedCount;
            availableObj.value = purchasedCount - allocatedCount;

            dataObj.push(allocatedObj);
            dataObj.push(availableObj);
            break;
        case 'over':
            allocatedObj.value = purchasedCount;
            availableObj.value = 0;
            overAllocatedObj.value = allocatedCount - purchasedCount;

            dataObj.push(allocatedObj);
            dataObj.push(availableObj);
            dataObj.push(overAllocatedObj);
            break;
            // when type = Display
            // status will be empty
        default:
            availableObj.value = purchasedCount;

            dataObj.push(availableObj);
    }


    donutDataObj.data = dataObj;
    // setting state with final donut data
    api.setState('donutData', [donutDataObj]);
    api.setState('isDonutDataAvailable', true);
}
