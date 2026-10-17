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
    const hasAccountEntitlements = api.data.has_account_entitlements.output.data.GlideRecord_Query.sn_sub_man_st_account_level_entitlement._rowCount > 0;
    const records = api.data.has_account_entitlements.output.data.GlideRecord_Query.sn_sub_man_st_account_level_entitlement._results;
    const results = {};

    records.forEach((element) => {
        if (element._row_data) {

            if (element._row_data.displayValue === "Now Assist usage" && !results.assist) {
                results.assist = {
                    allocated: Number(element.allocated_count.value) || 0,
                    purchased: Number(element.purchased_count.value) || 0,
                    available: Number(element.purchased_count.value) - Number(element.allocated_count.value),
                    overconsumed: Number(element.allocated_count.value) - Number(element.purchased_count.value) > 0 ? Number(element.allocated_count.value) - Number(element.purchased_count.value) : 0
                };
            }
            if (element._row_data.displayValue === "Now Assist creators" && !results.creator) {
                results.creator = {
                    allocated: Number(element.allocated_count.value) || 0,
                    purchased: Number(element.purchased_count.value) || 0,
                    available: Number(element.purchased_count.value) - Number(element.allocated_count.value),
                    overconsumed: Number(element.allocated_count.value) - Number(element.purchased_count.value) > 0 ? Number(element.allocated_count.value) - Number(element.purchased_count.value) : 0
                };
            }
        }

    });

    function getCount(count) {
        const score = [{
            "data": [{
                "change": "0",
                "changePercent": "0",
                "value": count
            }],
            "metadata": {
                "aggregate": {
                    "fieldType": "decimal"
                },
                "changeArrow": "steady",
                "dataSourceLabel": "",
                "eventData": {
                    "indicatorSysid": "fb007202d7130100b96d45a3ce6103b4"
                },
                "filterQuery": "",
                "format": {
                    "frequency": "daily",
                    "precision": 0,
                    "unitFormat": "{0}",
                    "abbreviationEnabled": false,
                    "decimalSeparator": ".",
                    "thousandSeparatorEnabled": true,
                    "rounding": "DOWN",
                    "groupingSeparator": ",",
                },
                "previousScoreDate": "",
                "scoreDate": ""
            }
        }];
        return score;
    }

    
    // assist cards
    if (results.assist) {
        api.setState('assistPurchasedCount', results.assist.purchased);
        api.setState('assistAllocatedCount', results.assist.allocated);
        api.setState('assistAvailableCount', results.assist.available);
        api.setState('assistOverconsumedCount', results.assist.overconsumed);
        if (results.assist.overconsumed > 0) {
            api.setState('assistShowOverconsumedCard', true);
        }
    } else {
        api.setState('assistPurchasedCount', 0);
        api.setState('assistAllocatedCount', 0);
        api.setState('assistAvailableCount', 0);
        api.setState('assistOverconsumedCount', 0);
    }

    if(results.creator) {
        // creator cards
        api.setState('creatorPurchasedCount', results.creator.purchased);
        api.setState('creatorAllocatedCount', results.creator.allocated);
        api.setState('creatorAvailableCount', results.creator.available);
        api.setState('creatorOverconsumedCount', results.creator.overconsumed);
        if (results.creator.overconsumed > 0) {
            api.setState('creatorShowOverconsumedCard', true);
        }
    } else {
        api.setState('creatorPurchasedCount', 0);
        api.setState('creatorAllocatedCount', 0);
        api.setState('creatorAvailableCount', 0);
        api.setState('creatorOverconsumedCount', 0);
    }
    // account entitlements
    api.setState('hasAccountEntitlements', hasAccountEntitlements);
}
