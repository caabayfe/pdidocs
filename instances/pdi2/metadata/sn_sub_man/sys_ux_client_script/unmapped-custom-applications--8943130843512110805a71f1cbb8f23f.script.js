/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // get count from Glide query
    const unmapped_custom_applications_count = api.data.unmapped_custom_applications.output.data.GlideAggregate_Query.length;
    
    const dataForCustomAppsSingleScoreCard = [{
        "data": [{
            "change": "0",
            "changePercent": "0",
            "value": unmapped_custom_applications_count
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
    
    // save it to state
    api.setState('dataForCustomAppsSingleScoreCard', dataForCustomAppsSingleScoreCard);
    api.setState('shouldShowCustomApplicationsSingleScoreCard', true);
    
    // save new flag icon and flag text to state
    if(unmapped_custom_applications_count) {
        api.setState('custom_app_flag_icon', 'Flag Event Outline');
        api.setState('custom_app_flag_text', api.state.needsAttention);
        api.setState('custom_app_color', 'critical');
    } else {
        api.setState('custom_app_flag_icon', 'Circle Check Outline');
        api.setState('custom_app_flag_text', api.state.allCaughtUp);
        api.setState('custom_app_color', 'green');
    }
}
