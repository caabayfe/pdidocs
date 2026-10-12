/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const query = api.data.unconfirmed_user_group_count.output.data.GlideAggregate_Query;
    if (!query)
        return;

    //If count exists and is greater than 0, change the unconfirmed user group status
    let status = {};
    const count = query[0].count;
    const dataForUnconfirmedGroupCountSingleScoreCard = [{
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
                "unitFormat": "{0}"
            },
            "previousScoreDate": "1642809600000",
            "scoreDate": "1642896000000"
        }
    }];

    if(count && count > 0) {
        status = {"displayText":api.state.needsAttention,"displayIcon":"Flag Event Outline ","color":"critical",dataForUnconfirmedGroupCountSingleScoreCard};
    } else {
        status = {"displayText": api.state.allCaughtUp,"displayIcon": "Circle Check Outline","color": "green",dataForUnconfirmedGroupCountSingleScoreCard};
    }
    
    api.setState('shouldShowUnconfirmedUserGroupsSingleScoreCard', true);
    api.setState('unconfirmed_user_group_status', status);
}
