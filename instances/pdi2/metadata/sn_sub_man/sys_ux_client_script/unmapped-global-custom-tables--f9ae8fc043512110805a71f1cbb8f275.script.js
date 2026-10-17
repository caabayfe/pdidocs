/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // get count from Glide query
    const res = api.data.unmapped_global_custom_tables.output.data.GlideRecord_Query.ua_custom_table_inventory;
    const unmapped_global_custom_tables_count = res._rowCount;

    const dataForCustomTablesSingleScoreCard = [{
        "data": [{
            "change": "0",
            "changePercent": "0",
            "value": unmapped_global_custom_tables_count
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

    // save count to state
    api.setState('dataForCustomTablesSingleScoreCard', dataForCustomTablesSingleScoreCard);
    api.setState('shouldShowCustomTablesSingleScoreCard', true);
    // save new flag icon and flag text to state
    if(unmapped_global_custom_tables_count) {
        api.setState('custom_table_flag_icon', 'Flag Event Outline');
        api.setState('custom_table_flag_text', api.state.needsAttention);
        api.setState('custom_table_color', 'critical');
    } else {
        api.setState('custom_table_flag_icon', "Circle Check Outline");
        api.setState('custom_table_flag_text', api.state.allCaughtUp);
        api.setState('custom_table_color', 'green');
    }
}
